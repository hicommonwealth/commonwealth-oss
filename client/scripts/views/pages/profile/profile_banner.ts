import m from 'mithril';
import app from 'state';
import { Button } from 'construct-ui';
import { notifyError, notifySuccess } from 'client/scripts/controllers/app/notifications';
import { setActiveAccount } from 'client/scripts/controllers/app/login';
import { formatAddressShort } from 'client/scripts/helpers';
import { Account } from 'models';


const ProfileBanner: m.Component<{ account: Account<any>, addressInfo: any }, { loading: boolean }> = {
  view: (vnode) => {
    const { account, addressInfo } = vnode.attrs;

    const createRole = (e) => {
      vnode.state.loading = true;

      app.user.createRole({
        address: addressInfo,
        chain: app.activeChainId(),
        community: app.activeCommunityId(),
      }).then(() => {
        vnode.state.loading = false;
        m.redraw();
        notifySuccess(`Joined with ${formatAddressShort(addressInfo.address, addressInfo.chain)}`);
        setActiveAccount(account).then(() => {
          m.redraw();
          $(e.target).trigger('modalexit');
        });
      }).catch((err: any) => {
        vnode.state.loading = false;
        m.redraw();
        notifyError(err.responseJSON.error);
      });
    };

    return m('.ProfileBanner', [
      m('.banner-text', 'This address is already in your keychain.'),
      m(Button, {
        label: 'Join community',
        disabled: vnode.state.loading,
        onclick: (e) => {
          e.preventDefault();
          createRole.bind(this);
        }
      })
    ]);
  }
};

export default ProfileBanner;