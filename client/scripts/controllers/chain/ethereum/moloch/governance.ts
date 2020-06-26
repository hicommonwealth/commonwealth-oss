import BN from 'bn.js';
import EthDater from 'ethereum-block-by-date';

import { ProposalModule, ITXModalData, ChainEntity } from 'models';

import { ERC20Token } from 'adapters/chain/ethereum/types';
import { IMolochProposalResponse } from 'adapters/chain/moloch/types';
import { EntityRefreshOption } from 'controllers/server/chain_entities';

import MolochStorageFetcher from 'commonwealth-chain-events/dist/src/moloch/storageFetcher';
import MolochEventSubscriber from 'commonwealth-chain-events/dist/src/moloch/subscriber';
import MolochEventProcessor from 'commonwealth-chain-events/dist/src/moloch/processor';
import { MolochEntityKind } from 'commonwealth-chain-events/dist/src/moloch/types';

import MolochProposal from './proposal';
import MolochMembers from './members';
import MolochAPI from './api';
import MolochMember from './member';
import Moloch from './adapter';

export default class MolochGovernance extends ProposalModule<
  MolochAPI,
  IMolochProposalResponse,
  MolochProposal
> {
  // MEMBERS
  private _proposalCount: BN;
  private _proposalDeposit: BN;
  private _gracePeriod: BN;
  private _summoningTime: BN;
  private _votingPeriodLength: BN;
  private _periodDuration: BN;
  private _abortWindow: BN;
  private _totalShares: BN;
  private _totalSharesRequested: BN;
  private _guildBank: string;

  private _api: MolochAPI;
  private _Members: MolochMembers;
  private _useClientChainEntities: boolean;

  // GETTERS
  public get proposalCount() { return this._proposalCount; }
  public get proposalDeposit() { return this._proposalDeposit; }
  public get gracePeriod() { return this._gracePeriod; }
  public get summoningTime() { return this._summoningTime; }
  public get votingPeriodLength() { return this._votingPeriodLength; }
  public get periodDuration() { return this._periodDuration; }
  public get abortWindow() { return this._abortWindow; }
  public get totalShares() { return this._totalShares; }
  public get totalSharesRequested() { return this._totalSharesRequested; }
  public get guildbank() { return this._guildBank; }
  public get currentPeriod() {
    return ((Date.now() / 1000) - this.summoningTime.toNumber()) / this.periodDuration.toNumber();
  }

  public get api() { return this._api; }
  public get useClientChainEntities() { return this._useClientChainEntities; }

  // INIT / DEINIT
  public async init(
    api: MolochAPI,
    Members: MolochMembers,
    useClientChainEntities = true,
  ) {
    this._Members = Members;
    this._useClientChainEntities = useClientChainEntities;
    this._api = api;
    this._guildBank = await this._api.Contract.guildBank();

    this._totalSharesRequested = new BN((await this._api.Contract.totalSharesRequested()).toString(), 10);
    this._totalShares = new BN((await this._api.Contract.totalShares()).toString(), 10);
    this._gracePeriod = new BN((await this._api.Contract.gracePeriodLength()).toString(), 10);
    this._abortWindow = new BN((await this._api.Contract.abortWindow()).toString(), 10);
    this._summoningTime = new BN((await this._api.Contract.summoningTime()).toString(), 10);
    this._votingPeriodLength = new BN((await this._api.Contract.votingPeriodLength()).toString(), 10);
    this._periodDuration = new BN((await this._api.Contract.periodDuration()).toString(), 10);
    this._proposalDeposit = new BN((await this._api.Contract.proposalDeposit()).toString(), 10);

    // fetch all proposals
    if (!this._useClientChainEntities) {
      console.log('Fetching moloch proposals from backend.');
      await this.app.chainEntities.refresh(this.app.chain.id, EntityRefreshOption.AllEntities);
      const entities = this.app.chainEntities.store.getByType(MolochEntityKind.Proposal);
      const constructorFunc = (e: ChainEntity) => new MolochProposal(this._Members, this, e);
      entities.map((p) => this._entityConstructor(constructorFunc, p));
    } else {
      console.log('Fetching moloch proposals from chain.');
      const fetcher = new MolochStorageFetcher(api.Contract, 1, new EthDater((this.app.chain as Moloch).chain.api));
      const subscriber = new MolochEventSubscriber(api.Contract, this.app.chain.id);
      const processor = new MolochEventProcessor(api.Contract, 1);
      await this.app.chainEntities.subscribeEntities(
        this.app.chain,
        fetcher,
        subscriber,
        processor,
      );
    }
    this._proposalCount = new BN(this.store.getAll().length);
    this._initialized = true;
  }

  public deinit() {
    this.store.clear();
  }

  public createTx(...args: any[]): ITXModalData {
    throw new Error('Method not implemented.');
  }

  // web wallet only create proposal transaction
  public async createPropWebTx(
    submitter: MolochMember,
    applicantAddress: string,
    tokenTribute: BN,
    sharesRequested: BN,
    details: string,
  ) {
    if (!(await this._Members.isSenderDelegate())) {
      throw new Error('sender must be valid delegate');
    }

    if (parseInt(applicantAddress, 16) === 0) {
      throw new Error('applicant cannot be 0');
    }

    const MAX_N_SHARES = new BN(10).pow(new BN(18));
    const newShareCount = sharesRequested.add(this.totalShares).add(this.totalSharesRequested);
    if (newShareCount.gt(MAX_N_SHARES)) {
      throw new Error('too many shares requested');
    }

    // first, we must approve xfer of proposal deposit tokens from the submitter
    const approvalTxReceipt = await submitter.approveTokenTx(
      new ERC20Token(this._api.tokenContract.address, this.proposalDeposit),
      this._api.contractAddress,
    );
    if (approvalTxReceipt.status !== 1) {
      throw new Error('failed to approve proposal deposit');
    }

    // once approved we assume the applicant has approved the tribute and proceed
    // TODO: this assumes the active user is the signer on the contract -- we should make this explicit
    const tx = await this._api.Contract.submitProposal(
      applicantAddress.toLowerCase(),
      tokenTribute.toString(),
      sharesRequested.toString(),
      details,
      { gasLimit: this._api.gasLimit },
    );
    const txReceipt = await tx.wait();
    if (txReceipt.status !== 1) {
      throw new Error('failed to submit proposal');
    }
  }
}
