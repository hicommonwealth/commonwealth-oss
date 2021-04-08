export interface ICompoundalphaHolder {
  // address of the member
  id: string;

  // balance
  balance: string;

  // delegates
  delegates: string;
}

export interface ICompoundalphaVote {
  // who voted
  delegateAddress: string;

  // when did they vote
  timestamp: string;

  // number of votes
  voteWeight: number;

  // 1 = yes, 2 = no, 0 = abstain
  uintVote: number;

  delegate: ICompoundalphaHolder;
}

export interface ICompoundalphaProposalResponse {
  // dummy field required by interfaces
  identifier: string;

  // unique identifier
  id: string;

  proposer: string; // author
  description: string;

  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];

  startBlock: number;
  endBlock: number;
  eta: number; // The timestamp that the proposal will be available for execution, set once the vote succeeds

  forVotes: number;
  againstVotes: number;

  canceled: boolean;
  executed: boolean;

  // TODO: State
}
