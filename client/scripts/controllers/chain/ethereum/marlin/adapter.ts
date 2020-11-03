// import { MarlinTypes } from '@commonwealth/chain-events';
import { EthereumCoin } from 'adapters/chain/ethereum/types';

import EthWebWalletController from 'controllers/app/eth_web_wallet';
import EthereumAccount from 'controllers/chain/ethereum/account';
import EthereumAccounts from 'controllers/chain/ethereum/accounts';
import EthereumChain from 'controllers/chain/ethereum/chain';
import { ChainBase, ChainClass, IChainAdapter, ChainEntity, ChainEvent, NodeInfo } from 'models';

import { setActiveAccount } from 'controllers/app/login';
import ChainEntityController from 'controllers/server/chain_entities';
import { IApp } from 'state';

import MarlinAPI from './api';
import MarlinChain from './chain';
import MarlinGovernance from './governance';
import MarlinProposal from './proposal';
import MarlinHolders from './holders';

export default class Marlin extends IChainAdapter<EthereumCoin, EthereumAccount> {
  public readonly base = ChainBase.Ethereum;
  public readonly class = ChainClass.Marlin;
  public chain: MarlinChain;
  public ethAccounts: EthereumAccounts;
  public accounts: MarlinHolders;
  public governance: MarlinGovernance;
  public readonly webWallet: EthWebWalletController = new EthWebWalletController();
  public readonly chainEntities = new ChainEntityController();

  constructor(meta: NodeInfo, app: IApp) {
    super(meta, app);
    this.chain = new MarlinChain(this.app);
    this.ethAccounts = new EthereumAccounts(this.app);
    this.accounts = new MarlinHolders(this.app);
    this.governance = new MarlinGovernance(this.app);
  }

  // public handleEntityUpdate(entity: ChainEntity, event: ChainEvent): void {
  //   switch (entity.type) {
  //     case MarlinTypes.EntityKind.Proposal: {
  //       const constructorFunc = (e: ChainEntity) => new MarlinProposal(this.accounts, this.governance, e);
  //       this.governance.updateProposal(constructorFunc, entity, event);
  //       break;
  //     }
  //     default: {
  //       console.error('Received invalid marlin chain entity!');
  //       break;
  //     }
  //   }
  // }

  public async initApi() {
    await this.chain.resetApi(this.meta);
    await this.chain.initMetadata();
    await this.ethAccounts.init(this.chain);
    await this.webWallet.enable();

    const activeAddress: string = this.webWallet.accounts && this.webWallet.accounts[0];
    const compContractAddress = this.meta.address;
    const governorAlphaContractAddress = '0xeDAA76873524f6A203De2Fa792AD97E459Fca6Ff';
    const api = new MarlinAPI(this.meta.address, governorAlphaContractAddress, this.chain.api.currentProvider as any, activeAddress);
    await api.init();
    this.chain.marlinApi = api;

    if (this.webWallet) {
      await this.webWallet.enable();
      await this.webWallet.web3.givenProvider.on('accountsChanged', (accounts) => {
        const updatedAddress = this.app.user.activeAccounts.find((addr) => addr.address === accounts[0]);
        setActiveAccount(updatedAddress);
      });
    }

    await this.webWallet.web3.givenProvider.on('accountsChanged', (accounts) => {
      const updatedAddress = this.app.user.activeAccounts.find((addr) => addr.address === accounts[0]);
      setActiveAccount(updatedAddress);
      api.updateSigner(accounts[0]);
    });

    // TODO: This was for marlin accounts? maybe not necessary
    await this.accounts.init(api, this.chain, this.ethAccounts);
    console.log('accounts:', this.accounts);
    this.block.height = await api.Provider.getBlockNumber();
    await super.initApi();
  }

  public async initData() {
    await this.chain.initEventLoop();
    await this.governance.init(this.chain, this.accounts); // TODO: create/add args?
    await super.initData(this.usingServerChainEntities);
  }

  public async deinit() {
    await super.deinit();
    this.governance.deinit();
    this.ethAccounts.deinit();
    this.accounts.deinit();
    this.chain.deinitMetadata();
    this.chain.deinitEventLoop();
    this.chain.deinitApi();
    console.log('Ethereum/Marlin stopped.');
  }
}
