import WebSocket from 'ws';
import _ from 'underscore';
import {
  IDisconnectedRange, IEventHandler, EventSupportingChains, IEventSubscriber,
  SubstrateTypes, SubstrateEvents, MolochTypes, MolochEvents, chainSupportedBy,
  MarlinTypes, MarlinEvents, Erc20Events
} from '@commonwealth/chain-events';

import EventStorageHandler, { StorageFilterConfig } from '../eventHandlers/storage';
import EventNotificationHandler from '../eventHandlers/notifications';
import EntityArchivalHandler from '../eventHandlers/entityArchival';
import IdentityHandler from '../eventHandlers/identity';
import UserFlagsHandler from '../eventHandlers/userFlags';
import ProfileCreationHandler from '../eventHandlers/profileCreation';
import { sequelize } from '../database';
import { constructSubstrateUrl } from '../../shared/substrate';
import { factory, formatFilename } from '../../shared/logging';
import { ChainNodeInstance } from '../models/chain_node';
const log = factory.getLogger(formatFilename(__filename));

// emit globally any transfer over 1% of total issuance
// TODO: config this
const BALANCE_TRANSFER_THRESHOLD_PERMILL: number = 10_000;
const BALANCE_TRANSFER_THRESHOLD: number = 10 ** 22;
/* TODO: both of these are imperfect solutions. The BALANCE_TRANSFER_THRESHOLD_PERMILL used
by the Substrate enricher uses an API call to get the max token amount of the chain its referring to
for every event it processes. This seems like too much overheard for the ERC20 enricher which 
could end being processed on through hundreds of chains all with rapid transfers happening. So
I have made it a fixed value here (1000 tokens if they're using the default decimal value) but
the ideal solution would be to have every chain's max token amount stored in the database. */

const discoverReconnectRange = async (models, chain: string): Promise<IDisconnectedRange> => {
  const lastChainEvent = await models.ChainEvent.findAll({
    limit: 1,
    order: [ [ 'block_number', 'DESC' ]],
    // this $...$ queries the data inside the include (ChainEvents don't have `chain` but ChainEventTypes do)...
    // we might be able to replicate this behavior with where and required: true inside the include
    where: {
      '$ChainEventType.chain$': chain,
    },
    include: [
      { model: models.ChainEventType }
    ]
  });
  if (lastChainEvent && lastChainEvent.length > 0 && lastChainEvent[0]) {
    const lastEventBlockNumber = lastChainEvent[0].block_number;
    log.info(`Discovered chain event in db at block ${lastEventBlockNumber}.`);
    return { startBlock: lastEventBlockNumber + 1 };
  } else {
    return { startBlock: null };
  }
};

const setupChainEventListeners = async (
  models, wss: WebSocket.Server, chains: string[] | 'all' | 'none', skipCatchup?: boolean
): Promise<{ [chain: string]: IEventSubscriber<any, any> }> => {
  const queryNode = (c: string): Promise<ChainNodeInstance> => models.ChainNode.findOne({
    where: { chain: c },
    include: [{
      model: models.Chain,
      where: { active: true },
      required: true,
    }],
  });
  log.info('Fetching node urls...');
  await sequelize.authenticate();
  const nodes: ChainNodeInstance[] = [];

  if (chains === 'all') {
    const n = (await Promise.all(EventSupportingChains.map((c) => queryNode(c)))).filter((c) => !!c);
    nodes.push(...n);
  } else if (chains !== 'none') {
    const n = (await Promise.all(EventSupportingChains
      .filter((c) => chains.includes(c))
      .map((c) => queryNode(c))))
      .filter((c) => !!c);
    nodes.push(...n);
  } else {
    log.info('No event listeners configured.');
    return {};
  }
  if (nodes.length === 0) {
    log.info('No event listeners found.');
    return {};
  }

  log.info('Setting up event listeners...');
  const generateHandlers = (node: ChainNodeInstance, storageConfig: StorageFilterConfig = {}) => {
    // writes events into the db as ChainEvents rows
    const storageHandler = new EventStorageHandler(models, node.chain, storageConfig);

    // emits notifications by writing into the db's Notifications table, and also optionally
    // sending a notification to the client via websocket
    const excludedNotificationEvents = [
      SubstrateTypes.EventKind.DemocracyTabled,
    ];
    const notificationHandler = new EventNotificationHandler(models, wss, excludedNotificationEvents);

    // creates and updates ChainEntity rows corresponding with entity-related events
    const entityArchivalHandler = new EntityArchivalHandler(models, node.chain, wss);

    // creates empty Address and OffchainProfile models for users who perform certain
    // actions, like voting on proposals or registering an identity
    const profileCreationHandler = new ProfileCreationHandler(models, node.chain);

    // the set of handlers, run sequentially on all incoming chain events
    const handlers: IEventHandler[] = [
      storageHandler,
      notificationHandler,
      entityArchivalHandler,
      profileCreationHandler,
    ];

    // only handle identities and user flags on substrate chains
    if (chainSupportedBy(node.chain, SubstrateTypes.EventChains)) {
      // populates identity information in OffchainProfiles when received (Substrate only)
      const identityHandler = new IdentityHandler(models, node.chain);

      // populates is_validator and is_councillor flags on Addresses when validator and
      // councillor sets are updated (Substrate only)
      const userFlagsHandler = new UserFlagsHandler(models, node.chain);

      handlers.push(identityHandler, userFlagsHandler);
    }

    return handlers;
  };

  const subscribers = await Promise.all(nodes.map(async (node) => {
    let subscriber: IEventSubscriber<any, any>;
    if (chainSupportedBy(node.chain, SubstrateTypes.EventChains)) {
      const nodeUrl = constructSubstrateUrl(node.url);
      const api = await SubstrateEvents.createApi(nodeUrl, node.Chain.substrate_spec);
      const excludedEvents = [
        SubstrateTypes.EventKind.Reward,
        SubstrateTypes.EventKind.TreasuryRewardMinting,
        SubstrateTypes.EventKind.TreasuryRewardMintingV2,
        SubstrateTypes.EventKind.HeartbeatReceived,
      ];

      const handlers = generateHandlers(node, { excludedEvents });
      subscriber = await SubstrateEvents.subscribeEvents({
        chain: node.chain,
        handlers,
        skipCatchup,
        discoverReconnectRange: () => discoverReconnectRange(models, node.chain),
        api,
        enricherConfig: {
          balanceTransferThresholdPermill: BALANCE_TRANSFER_THRESHOLD_PERMILL,
        }
      });
    } else if (chainSupportedBy(node.chain, MolochTypes.EventChains)) {
      const contractVersion = 1;
      const api = await MolochEvents.createApi(node.url, contractVersion, node.address);
      const handlers = generateHandlers(node);
      subscriber = await MolochEvents.subscribeEvents({
        chain: node.chain,
        handlers,
        skipCatchup,
        discoverReconnectRange: () => discoverReconnectRange(models, node.chain),
        api,
        contractVersion,
      });
    } else if (chainSupportedBy(node.chain, MarlinTypes.EventChains)) {
      const governorAlphaContractAddress = '0x777992c2E4EDF704e49680468a9299C6679e37F6';
      const timelockContractAddress = '0x42Bf58AD084595e9B6C5bb2aA04050B0C291264b';
      const api = await MarlinEvents.createApi(
        node.url, {
          comp: node.address,
          governorAlpha: governorAlphaContractAddress,
          timelock: timelockContractAddress,
        }
      );
      const handlers = generateHandlers(node);
      subscriber = await MarlinEvents.subscribeEvents({
        chain: node.chain,
        handlers,
        skipCatchup,
        discoverReconnectRange: () => discoverReconnectRange(models, node.chain),
        api,
      });
    }

    // hook for clean exit
    process.on('SIGTERM', () => {
      if (subscriber) {
        subscriber.unsubscribe();
      }
    });
    return [ node.chain, subscriber ];
  }));

  // Add Erc20 subscribers
  if (chains === 'all' || chains.includes('erc20')) {
    const erc20Nodes = await models.ChainNode.findAll({
      include: [{
        model: models.Chain,
        where: { type: 'token' },
      }],
    });
    const erc20Addresses = erc20Nodes.map((o) => o.address);

    // get ethereum's endpoint URL as most canonical one
    const ethNode = await models.ChainNode.findOne({
      where: {
        chain: 'ethereum'
      }
    });
    const ethUrl = ethNode.url;

    const api = await Erc20Events.createApi(ethUrl, erc20Addresses);
    // we only need notifications for ERC20s
    const storageHandler = new EventStorageHandler(models, 'erc20', {});
    const notificationHandler = new EventNotificationHandler(models, wss);
    const subscriber = await Erc20Events.subscribeEvents({
      chain: 'erc20',
      handlers: [ storageHandler, notificationHandler ],
      skipCatchup,
      api,
      discoverReconnectRange: async () => discoverReconnectRange(models, 'erc20'),
      enricherConfig: {
        balanceTransferThreshold: BALANCE_TRANSFER_THRESHOLD,
      }
    });
    process.on('SIGTERM', () => {
      if (subscriber) {
        subscriber.unsubscribe();
      }
    });
    subscribers.push([ 'erc20', subscriber ]);
  }

  return _.object<{ [chain: string]:  IEventSubscriber<any, any> }>(subscribers);
};

export default setupChainEventListeners;
