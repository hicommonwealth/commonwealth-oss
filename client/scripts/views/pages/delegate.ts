
import 'pages/proposals.scss';

import m from 'mithril';
import mixpanel from 'mixpanel-browser';

import app from 'state';
import { formatCoin } from 'adapters/currency';
import { formatDuration, blockperiodToDuration } from 'helpers';
import { ProposalType } from 'identifiers';
import { ChainClass, ChainBase, ChainNetwork } from 'models';
import Edgeware from 'controllers/chain/edgeware/main';
import {
  convictionToWeight, convictionToLocktime, convictions
} from 'controllers/chain/substrate/democracy_referendum';
import Sublayout from 'views/sublayout';
import PageLoading from 'views/pages/loading';
import ProposalsLoadingRow from 'views/components/proposals_loading_row';
import ProposalRow from 'views/components/proposal_row';
import { CountdownUntilBlock } from 'views/components/countdown';
import Substrate from 'controllers/chain/substrate/main';
import Cosmos from 'controllers/chain/cosmos/main';
import Moloch from 'controllers/chain/ethereum/moloch/adapter';
import Marlin from 'controllers/chain/ethereum/marlin/adapter';
import NewProposalPage from 'views/pages/new_proposal/index';
import { Grid, Col, List } from 'construct-ui';
import moment from 'moment';
import Listing from './listing';
import ErrorPage from './error';
import PageNotFound from './404';

async function loadCmd() {
  if (!app || !app.chain || !app.chain.loaded) {
    throw new Error('secondary loading cmd called before chain load');
  }
  if (app.chain.base !== ChainBase.Substrate) {
    return;
  }
  const chain = (app.chain as Substrate);
  await Promise.all([
    chain.council.init(chain.chain, chain.accounts),
    chain.signaling.init(chain.chain, chain.accounts),
    chain.democracyProposals.init(chain.chain, chain.accounts),
    chain.democracy.init(chain.chain, chain.accounts),
  ]);
}

const DelegateForm: m.Component<{}> = {
  view: (vnode) => {
    return m('.DelegateForm', [
      'hi',
    ]);
  }
};

const DelegatePage: m.Component<{}> = {

  view: (vnode) => {
    if (!app.chain || !app.chain.loaded) {
      return m(PageLoading, {
        message: 'Connecting to chain (may take up to 10s)...',
        title: 'Proposals',
        showNewProposalButton: true,
      });
    }

    if (app.chain?.network !== ChainNetwork.Marlin) {
      return m(PageNotFound, {
        title: 'Delegate page for Marlin only!'
      });
    }

    return m(Sublayout, {
      class: 'DelegatePage',
      title: 'Delegate',
      showNewProposalButton: true,
    }, [
      m('.forum-container', [
        m(DelegateForm, {

        }),
      ]),
    ]);
  }
};

export default DelegatePage;
