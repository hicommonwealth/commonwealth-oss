import 'pages/validators.scss';

import m from 'mithril';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';

import app, { ApiStatus } from 'state';
import { Coin, formatCoin } from 'adapters/currency';
import { IValidators, SubstrateAccount } from 'controllers/chain/substrate/account';
import { ICosmosValidator } from 'controllers/chain/cosmos/account';
import User from 'views/components/widgets/user';
import PageLoading from 'views/pages/loading';
import { ChainBase, ChainClass } from 'models';
import Substrate from 'controllers/chain/substrate/main';
import Cosmos from 'controllers/chain/cosmos/main';
import Sublayout from 'views/sublayout';

import * as CosmosValidationViews from './cosmos';
import { SubstratePreHeader, SubstratePresentationComponent } from './substrate';
import { formatAddressShort } from '../../../../../shared/utils';

export interface IValidatorAttrs {
  stash: string;
  total: Coin;
  nominators?: any;
  error?: any;
  sending?: boolean;
  name?: string;
  bonded?: Coin;
  nominated?: Coin;
  controller?: string;
  hasNominated?: boolean;
  onChangeHandler?: any;
}

export interface IValidatorPageState {
  validators: IValidators | { [address: string]: ICosmosValidator };
  nominations: any[];
  originalNominations: any[];
  nominationsHasChanged: boolean;
  results: any[];
}

export const ViewNominatorsModal : m.Component<{ nominators, validatorAddr }> = {
  view: (vnode) => {
    return m('.ViewNominatorsModal', [
      m('.compact-modal-title', [
        m('h3', `Nominators for ${formatAddressShort(vnode.attrs.validatorAddr, null)}`), // TODO: provide chain
      ]),
      m('.compact-modal-body', [
        m('table', [
          m('tr', [
            m('th', 'Nominator'),
            m('th', 'Amount'),
          ]),
          vnode.attrs.nominators.map((n) => {
            return m('tr', [
              m('td', m(User, {
                user: app.chain.accounts.get(n.stash),
                linkify: true,
                onclick: () => {
                  this.trigger('modalexit');
                }
              })),
              m('td', formatCoin(n.balance, true)),
            ]);
          }),
        ])
      ]),
    ]);
  }
};

export const Validators: m.Component<IValidatorAttrs, IValidatorPageState> = {
  oninit: (vnode) => {
    vnode.state.nominations = [];
    vnode.state.originalNominations = [];
    vnode.state.nominationsHasChanged = false;
    app.runWhenReady(async () => {
      vnode.state.validators = (app.chain.base === ChainBase.Substrate)
        ? await (app.chain as Substrate).accounts.validators : null;
      // vnode.state.currentSession = (app.chain.base === ChainBase.Substrate)
      //   ? await (app.chain as Substrate).chain.session : null;
      // vnode.state.currentEra = (app.chain.base === ChainBase.Substrate)
      //   ? await (app.chain as Substrate).chain.currentEra : null;
      // vnode.state.activeEra = (app.chain.base === ChainBase.Substrate)
      //   ? await (app.chain as Substrate).chain.activeEra : null;
      // vnode.state.stakingLedger = (app.chain.base === ChainBase.Substrate && app.user.activeAccount)
      //   ? await (app.user.activeAccount as SubstrateAccount).stakingLedger
      //   : null;
    });
  },
  onupdate: (vnode) => {
    vnode.state.nominationsHasChanged = !_.isEqual(
      vnode.state.originalNominations.sort(),
      vnode.state.nominations.sort()
    );
    if (vnode.state.nominationsHasChanged) m.redraw();
  },
  view: (vnode) => {
    let vComponents = [];
    switch (app.chain.class) {
      case ChainClass.Edgeware:
      case ChainClass.Kusama:
      case ChainClass.Polkadot: {
        vComponents = [
          m(SubstratePreHeader, {
            sender: app.user.activeAccount as SubstrateAccount,
            nominations: vnode.state.nominations,
            nominationsHasChanged: vnode.state.nominationsHasChanged
          }),
          SubstratePresentationComponent(vnode.state, app.chain as Substrate),
        ];
        break;
      }
      case ChainClass.CosmosHub:
        vComponents = [
          CosmosValidationViews.ValidationPreHeader(app.chain as Cosmos),
          CosmosValidationViews.ValidatorPresentationComponent(app.chain as Cosmos),
        ];
        break;
      default:
        break;
    }

    return m('.Validators', vComponents);
  }
};

const ValidatorPage : m.Component<{}> = {
  oncreate: (vnode) => {
    mixpanel.track('PageVisit', { 'Page Name': 'ValidatorPage' });
  },
  view: (vnode) => {
    if (!app.chain || app.chain.networkStatus !== ApiStatus.Connected) return m(PageLoading);
    return m(Sublayout, {
      class: 'ValidatorPage',
    }, [
      m(Validators),
      m('.clear'),
    ]);
  },
};

export default ValidatorPage;
