import m from 'mithril';
import app from 'state';
import { Popover, Icons, Icon, MenuDivider, MenuItem, Tooltip, PopoverMenu } from 'construct-ui';
import { ChainBase } from 'models';
import Substrate from 'controllers/chain/substrate/main';
import User from 'views/components/widgets/user';
import { makeDynamicComponent } from 'models/mithril';
import { StakerState } from 'controllers/chain/substrate/staking';
import Identity from 'views/pages/validators/substrate/identity';
import { DeriveStakingAccount, DeriveBalancesAll } from '@polkadot/api-derive/types';
import { formatCoin } from 'adapters/currency';
import { SubstrateAccount } from 'controllers/chain/substrate/account';
import AddressInfo from './address_info';
import ListNominees from './list_nominees';
import SetSessionKey from './set_session_key';
import SetValidator from './set_validator';
import SetNominators from './set_nominators';
import { openTXModal } from './new_nominator';

export interface IAccountActionsState {
  dynamic: {
    balancesAll: DeriveBalancesAll,
    stakingAccount: DeriveStakingAccount
  }
}

export interface AccountActionsAttrs {
  info: StakerState
}

interface IModel {
  onNewSession(e: Event, controllerId: string, stashId: string): void
  onSetValidator(e: Event, controllerId: string, stashId: string): void
  onSetNominators(e: Event, controllerId: string, stashId: string): void
  onStop(e: Event, controllerId: string, stashId: string): void
}

const model: IModel = {
  onNewSession: (e, controllerId, stashId) => {
    e.preventDefault();
    app.modals.create({
      modal: SetSessionKey,
      data: { controllerId, stashId }
    });
  },
  onSetValidator: (e, controllerId, stashId) => {
    e.preventDefault();
    app.modals.create({
      modal: SetValidator,
      data: { controllerId, stashId }
    });
  },
  onSetNominators: (e, controllerId, stashId) => {
    e.preventDefault();
    app.modals.create({
      modal: SetNominators,
      data: { controllerId, stashId }
    });
  },
  onStop: (e, controllerId, stashId) => {
    const controller = app.chain.accounts.get(controllerId);
    const txFunc = (controller as unknown as SubstrateAccount).chillTx();
    openTXModal(txFunc);
  }
};

const AccountActionsRow = makeDynamicComponent<AccountActionsAttrs, IAccountActionsState>({
  getObservables: (attrs) => ({
    groupKey: attrs.info.stashId,
    balancesAll: (app.chain.base === ChainBase.Substrate)
      ? (app.chain as Substrate).staking.balancesAll(attrs.info.stashId)
      : null,
    stakingAccount: (app.chain.base === ChainBase.Substrate)
      ? (app.chain as Substrate).staking.stakingAccount(attrs.info.stashId)
      : null
  }),
  view: (vnode) => {
    const { stakingAccount, balancesAll } = vnode.state.dynamic;
    const balance = stakingAccount?.stakingLedger?.active.unwrap();
    if (!stakingAccount || !balancesAll)
      return m('p', 'Loading ...');

    const {
      controllerId, destination, destinationId,
      hexSessionIdNext, hexSessionIdQueue, isLoading,
      isOwnController, isOwnStash, isStashNominating,
      isStashValidating, nominating, sessionIds,
      stakingLedger, stashId } = vnode.attrs.info;

    return m('tr.ManageStakingRow', [
      m('td.val-stashes', app.chain.loaded && m(Popover, {
        interactionType: 'hover',
        content: m(Identity, { stash: stashId }),
        trigger: m('div.stashes', m(User, {
          user: app.chain.accounts.get(stashId),
          linkify: true }))
      })),
      m('td.val-controller', app.chain.loaded && m(Popover, {
        interactionType: 'hover',
        content: m(Identity, { stash: controllerId }),
        trigger: m('div.controller', m(User, {
          user: app.chain.accounts.get(controllerId),
          linkify: true }))
      })),
      m('td.val-rewards', destination),
      m('td.val-bonded', formatCoin(app.chain.chain.coins(balance), true)),
      m('td.val-all', isStashValidating
        ? m(AddressInfo, {
          address: stashId,
          withHexSessionId: hexSessionIdNext !== '0x' && [hexSessionIdQueue, hexSessionIdNext],
          stakingAccount
        })
        : isStashNominating && m(ListNominees, {
          stashId,
          nominating
        })),
      !isLoading && m('td.val-btns', (isStashNominating || isStashValidating)
        ? m('span.icon-text.pointer', m(Tooltip, {
          content: 'Stop',
          trigger: m(Icon, {
            name: Icons.STOP_CIRCLE,
            size: 'lg',
            onclick: (e) => model.onStop(e, controllerId, stashId)
          })
        }))
        : m('div',
          (!sessionIds.length || hexSessionIdNext === '0x')
            ? m('span.icon-text.pointer', m(Tooltip, {
              content: 'Session Key',
              trigger: m(Icon, {
                name: Icons.KEY,
                size: 'lg',
                onclick: (e) => model.onNewSession(e, controllerId, stashId)
              })
            })) : m('span.icon-text.pointer', m(Tooltip, {
              content: 'Validate',
              trigger: m(Icon, {
                name: Icons.STAR,
                size: 'lg',
                onclick: (e) => model.onSetValidator(e, controllerId, stashId)
              })
            })),
          m('span.icon-text.pointer', m(Tooltip, {
            content: 'Nominate',
            trigger: m(Icon, {
              name: Icons.THUMBS_UP,
              size: 'lg',
              onclick: (e) => model.onSetNominators(e, controllerId, stashId)
            })
          })))),
      // m('td.val-settings',
      //   m('span.right',
      //     m(PopoverMenu, {
      //       overlayClass: 'manage-staking-settings',
      //       content: [
      //         m(MenuItem, { label: 'Bond more funds' }),
      //         m(MenuItem, { label: 'Unbond funds' }),
      //         m(MenuItem, { label: 'Withdraw unbonded funds' }),
      //         m(MenuDivider),
      //         m(MenuItem, { label: 'Change controller account' }),
      //         m(MenuItem, { label: 'Change reward destination' }),
      //         m(MenuItem, { label: 'Change validator preferences' }),
      //         m(MenuDivider),
      //         m(MenuItem, { label: 'Change session keys' }),
      //         m(MenuItem, { label: 'Set nominees' }),
      //         m(MenuItem, { label: 'Inject session keys (advanced)' }),
      //       ],
      //       menuAttrs: { size: 'xs' },
      //       trigger: m(Icon, { name: Icons.SETTINGS, size: 'lg' })
      //     })))
    ]);
  }
});

export default AccountActionsRow;