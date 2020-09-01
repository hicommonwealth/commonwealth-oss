import 'pages/proposals.scss';

import m from 'mithril';
import mixpanel from 'mixpanel-browser';

import app from 'state';
import { formatCoin } from 'adapters/currency';
import { formatDuration, blockperiodToDuration } from 'helpers';
import { ProposalType } from 'identifiers';
import { ChainClass, ChainBase } from 'models';
import Edgeware from 'controllers/chain/edgeware/main';
import {
  convictionToWeight, convictionToLocktime, convictions
} from 'controllers/chain/substrate/democracy_referendum';
import Sublayout from 'views/sublayout';
import PageLoading from 'views/pages/loading';
import ConvictionsTable from 'views/components/proposals/convictions_table';
import ProposalsLoadingRow from 'views/components/proposals_loading_row';
import ProposalRow from 'views/components/proposal_row';
import { CountdownUntilBlock } from 'views/components/countdown';
import Substrate from 'controllers/chain/substrate/main';
import Cosmos from 'controllers/chain/cosmos/main';
import Moloch from 'controllers/chain/ethereum/moloch/adapter';
import NewProposalPage from 'views/pages/new_proposal/index';
import { Grid, Col, List } from 'construct-ui';
import moment from 'moment';
import Listing from './listing';

const SubstrateProposalStats: m.Component<{}, {}> = {
  view: (vnode) => {
    if (!app.chain) return;

    return m(Grid, {
      align: 'middle',
      class: 'stats-container',
      gutter: 5,
      justify: 'space-between'
    }, [
      m(Col, { span: { xs: 6, md: 3 } }, [
        m('.stats-tile', [
          m('.stats-heading', 'Next referendum'),
          (app.chain as Substrate).democracyProposals.nextLaunchBlock
            ? m(CountdownUntilBlock, {
              block: (app.chain as Substrate).democracyProposals.nextLaunchBlock,
              includeSeconds: false
            })
            : '--',
        ]),
      ]),
      m(Col, { span: { xs: 6, md: 3 } }, [
        m('.stats-tile', [
          m('.stats-heading', 'Enactment delay'),
          (app.chain as Substrate).democracy.enactmentPeriod
            ? blockperiodToDuration((app.chain as Substrate).democracy.enactmentPeriod).asDays()
            : '--',
          ' days'
        ]),
      ]),
      m(Col, { span: { xs: 6, md: 3 } }, [
        m('.stats-tile', [
          m('.stats-heading', 'Next treasury spend'),
          (app.chain as Substrate).treasury.nextSpendBlock
            ? m(CountdownUntilBlock, {
              block: (app.chain as Substrate).treasury.nextSpendBlock,
              includeSeconds: false
            })
            : '--',
        ]),
      ]),
      m(Col, { span: { xs: 6, md: 3 } }, [
        // TODO: Pot is under construction
        m('.stats-tile', [
          m('.stats-heading', 'Treasury balance'),
          app.chain && formatCoin((app.chain as Substrate).treasury.pot),
        ]),
      ]),
    ]);
    // onMoloch && m('.stats-tile', [
    //   m('.stats-tile-label', 'DAO Basics'),
    //   m('.stats-tile-figure-minor', [
    //     `Voting Period Length: ${onMoloch && (app.chain as Moloch).governance.votingPeriodLength}`
    //   ]),
    //   m('.stats-tile-figure-minor', [
    //     `Total Shares: ${onMoloch && (app.chain as Moloch).governance.totalShares}`
    //   ]),
    //   m('.stats-tile-figure-minor', [
    //     `Summoned At: ${onMoloch && (app.chain as Moloch).governance.summoningTime}`
    //   ]),
    //   m('.stats-tile-figure-minor', [
    //     `Proposal Count: ${onMoloch && (app.chain as Moloch).governance.proposalCount}`
    //   ]),
    //   m('.stats-tile-figure-minor', [
    //     `Proposal Deposit: ${onMoloch && (app.chain as Moloch).governance.proposalDeposit}`
    //   ]),
    // ]),
  }
};

const ProposalsPage: m.Component<{}> = {
  oncreate: (vnode) => {
    mixpanel.track('PageVisit', { 'Page Name': 'ProposalsPage' });
    let returningFromThread = false;
    Object.values(ProposalType).forEach((type) => {
      if (app.lastNavigatedBack() && app.lastNavigatedFrom().includes(`/proposal/${type}/`)) {
        returningFromThread = true;
      }
    });
    console.log(returningFromThread);
    console.log(Number(localStorage[`${app.activeId()}-proposals-scrollY`]));
    if (returningFromThread && localStorage[`${app.activeId()}-proposals-scrollY`]) {
      setTimeout(() => {
        console.log('SCROLLING');
        window.scrollTo(0, Number(localStorage[`${app.activeId()}-proposals-scrollY`]));
      }, 1);
    }
  },
  view: (vnode) => {
    if (!app.chain || !app.chain.loaded) return m(PageLoading, { message: 'Connecting to chain (may take up to 30s)...', title: 'Proposals' });
    const onSubstrate = app.chain && app.chain.base === ChainBase.Substrate;
    const onMoloch = app.chain && app.chain.class === ChainClass.Moloch;

    // active proposals
    const activeDemocracyReferenda = onSubstrate
      && (app.chain as Substrate).democracy.store.getAll().filter((p) => !p.completed);
    const activeDemocracyProposals = onSubstrate
      && (app.chain as Substrate).democracyProposals.store.getAll().filter((p) => !p.completed);
    const activeCouncilProposals = onSubstrate
      && (app.chain as Substrate).council.store.getAll().filter((p) => !p.completed);
    const activeSignalingProposals = (app.chain && app.chain.class === ChainClass.Edgeware)
      && (app.chain as Edgeware).signaling.store.getAll()
        .filter((p) => !p.completed).sort((p1, p2) => p1.getVotes().length - p2.getVotes().length);
    const activeTreasuryProposals = onSubstrate
      && (app.chain as Substrate).treasury.store.getAll().filter((p) => !p.completed);
    const activeCosmosProposals = (app.chain && app.chain.base === ChainBase.CosmosSDK)
      && (app.chain as Cosmos).governance.store.getAll()
        .filter((p) => !p.completed).sort((a, b) => +b.identifier - +a.identifier);
    const activeMolochProposals = onMoloch
      && (app.chain as Moloch).governance.store.getAll().filter((p) => !p.completed)
        .sort((p1, p2) => +p2.data.timestamp - +p1.data.timestamp);

    const activeProposalContent = !activeDemocracyReferenda?.length
      && !activeDemocracyProposals?.length
      && !activeCouncilProposals?.length
      && !activeSignalingProposals?.length
      && !activeCosmosProposals?.length
      && !activeMolochProposals?.length
      ? [ m('.no-proposals', 'None') ]
      : (activeDemocracyReferenda || []).map((proposal) => m(ProposalRow, { proposal }))
        .concat((activeDemocracyProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((activeCouncilProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((activeSignalingProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((activeCosmosProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((activeMolochProposals || []).map((proposal) => m(ProposalRow, { proposal })));

    const activeTreasuryContent = activeTreasuryProposals.length
      ? activeTreasuryProposals.map((proposal) => m(ProposalRow, { proposal }))
      : [ m('.no-proposals', 'None') ];

    // inactive proposals
    const inactiveDemocracyReferenda = onSubstrate
      && (app.chain as Substrate).democracy.store.getAll().filter((p) => p.completed);
    const inactiveDemocracyProposals = onSubstrate
      && (app.chain as Substrate).democracyProposals.store.getAll().filter((p) => p.completed);
    const inactiveCouncilProposals = onSubstrate
      && (app.chain as Substrate).council.store.getAll().filter((p) => p.completed);
    const inactiveSignalingProposals = (app.chain && app.chain.class === ChainClass.Edgeware)
      && (app.chain as Edgeware).signaling.store.getAll()
        .filter((p) => p.completed).sort((p1, p2) => p1.getVotes().length - p2.getVotes().length);
    const inactiveTreasuryProposals = onSubstrate
      && (app.chain as Substrate).treasury.store.getAll().filter((p) => p.completed);
    const inactiveCosmosProposals = (app.chain && app.chain.base === ChainBase.CosmosSDK)
      && (app.chain as Cosmos).governance.store.getAll()
        .filter((p) => p.completed).sort((a, b) => +b.identifier - +a.identifier);
    const inactiveMolochProposals = onMoloch
      && (app.chain as Moloch).governance.store.getAll().filter((p) => p.completed)
        .sort((p1, p2) => +p2.data.timestamp - +p1.data.timestamp);

    const inactiveProposalContent = !inactiveDemocracyReferenda?.length
      && !inactiveDemocracyProposals?.length
      && !inactiveCouncilProposals?.length
      && !inactiveSignalingProposals?.length
      && !inactiveCosmosProposals?.length
      && !inactiveMolochProposals?.length
      ? [ m('.no-proposals', 'None') ]
      : (inactiveDemocracyReferenda || []).map((proposal) => m(ProposalRow, { proposal }))
        .concat((inactiveDemocracyProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((inactiveCouncilProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((inactiveSignalingProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((inactiveCosmosProposals || []).map((proposal) => m(ProposalRow, { proposal })))
        .concat((inactiveMolochProposals || []).map((proposal) => m(ProposalRow, { proposal })));

    const inactiveTreasuryContent = inactiveTreasuryProposals.length
      ? inactiveTreasuryProposals.map((proposal) => m(ProposalRow, { proposal }))
      : [ m('.no-proposals', 'None') ];

    // XXX: display these
    const visibleTechnicalCommitteeProposals = app.chain
      && (app.chain.class === ChainClass.Kusama || app.chain.class === ChainClass.Polkadot)
      && (app.chain as Substrate).technicalCommittee.store.getAll();

    // let nextReferendum;
    // let nextReferendumDetail;
    // if (!onSubstrate) {
    //   // do nothing
    // } else if ((app.chain as Substrate).democracyProposals.lastTabledWasExternal) {
    //   if (visibleDemocracyProposals)
    //     [nextReferendum, nextReferendumDetail] = ['Democracy', ''];
    //   else
    //     [nextReferendum, nextReferendumDetail] = ['Council',
    //       'Last was council, but no democracy proposal was found'];
    // } else if ((app.chain as Substrate).democracyProposals.nextExternal)
    //   [nextReferendum, nextReferendumDetail] = ['Council', ''];
    // else
    //   [nextReferendum, nextReferendumDetail] = ['Democracy',
    //     'Last was democracy, but no council proposal was found'];

    const maxConvictionWeight = Math.max.apply(this, convictions().map((c) => convictionToWeight(c)));
    const maxConvictionLocktime = Math.max.apply(this, convictions().map((c) => convictionToLocktime(c)));

    return m(Sublayout, {
      class: 'ProposalsPage',
      title: 'Proposals',
      showNewProposalButton: true,
    }, [
      onSubstrate && m(SubstrateProposalStats),
      m(Listing, {
        content: activeProposalContent,
        columnHeaders: ['Active Proposals', 'Replies', 'Likes', 'Updated'],
        rightColSpacing: [4, 4, 4]
      }),
      m(Listing, {
        content: activeTreasuryContent,
        columnHeaders: ['Active Treasury Proposals'],
        rightColSpacing: [0]
      }),
      m(Listing, {
        content: inactiveProposalContent,
        columnHeaders: ['Inactive Proposals', 'Replies', 'Likes', 'Updated'],
        rightColSpacing: [4, 4, 4]
      }),
      m(Listing, {
        content: inactiveTreasuryContent,
        columnHeaders: ['Inactive Treasury Proposals'],
        rightColSpacing: [0]
      })
    ]);
  }
};

export default ProposalsPage;
