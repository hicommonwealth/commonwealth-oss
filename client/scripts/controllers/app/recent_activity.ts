import RecentActivityStore, { IAddressCountAndInfo } from 'client/scripts/stores/ActivityStore';
import { OffchainThread, AddressInfo } from 'models';
class RecentActivityController {
  private _store = new RecentActivityStore();

  public get store() { return this._store; }

  private _initialized = false;

  public get initialized() { return this._initialized; }

  public addThreads(threads: OffchainThread[]) {
    threads.forEach((thread) => this._store.addThread(thread));
  }

  public addAddresses(addresses: AddressInfo) {

  }

  public addAddressesFromActivity(activity: any[]) {
    activity
      .sort((a, b) => (b.updated_at || b.created_at) - (a.updated_at || a.created_at))
      .forEach((item) => {
        const parentEntity = item.community || item.chain;
        this._store.addAddress(item.Address, parentEntity);
      });
  }

  public getThreadsByCommunity(community: string): Array<OffchainThread> {
    return this._store.getThreadsByCommunity(community);
  }

  public getAddressesByCommunity(community: string): Array<AddressInfo> {
    return this._store.getAddressesByCommunity(community);
  }

  public getAddressActivityByCommunity(community:string): IAddressCountAndInfo {
    return this._store.getAddressActivityByCommunity(community);
  }
}

export default RecentActivityController;