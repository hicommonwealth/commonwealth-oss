import { ChainBase } from './types';
import Account from './Account';

interface IWebWallet<AccountT extends { address: string } | string> {
  label: string;
  available: boolean;
  enabled: boolean;
  accounts: readonly AccountT[];
  enable: () => Promise<void>;
  validateWithAccount: (account: Account<any>) => Promise<void>;

  chain: ChainBase;
}

export default IWebWallet;
