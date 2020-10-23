import 'pages/discussions/index.scss';

import $ from 'jquery';
import _ from 'lodash';
import m from 'mithril';
import mixpanel from 'mixpanel-browser';
import moment from 'moment-twitter';
import app from 'state';

import { Spinner } from 'construct-ui';
import { pluralize } from 'helpers';
import { OffchainThreadKind, NodeInfo, CommunityInfo } from 'models';

import { updateLastVisited } from 'controllers/app/login';
import Sublayout from 'views/sublayout';
import PageLoading from 'views/pages/loading';
import EmptyTopicPlaceholder from 'views/components/empty_topic_placeholder';
import ProposalsLoadingRow from 'views/components/proposals_loading_row';
import Listing from 'views/pages/listing';

import { notifyError } from 'controllers/app/notifications';
import { ListingSidebar } from './sidebar';
import PinnedListing from './pinned_listing';
import DiscussionRow from './discussion_row';

interface IDiscussionPageState {
  lookback?: { [community: string]: moment.Moment} ;
  postsDepleted?: boolean;
  lastVisitedUpdated?: boolean;
  topicInitialized: any;
  onscroll: any;
}

const getLastUpdate = (proposal) => {
  const lastComment = Number(app.comments.lastCommented(proposal));
  const createdAt = Number(proposal.createdAt.utc());
  const lastUpdate = Math.max(createdAt, lastComment);
  return lastUpdate;
};

const getLastSeenDivider = (hasText = true) => {
  return m('.LastSeenDivider', hasText ? [
    m('hr'),
    m('span', 'Last visit'),
    m('hr'),
  ] : [
    m('hr'),
  ]);
};

const DiscussionsPage: m.Component<{ topic?: string }, IDiscussionPageState> = {
  oncreate: (vnode) => {
    mixpanel.track('PageVisit', {
      'Page Name': 'DiscussionsPage',
      Scope: app.activeId(),
    });

    const returningFromThread = (app.lastNavigatedBack() && app.lastNavigatedFrom().includes('/proposal/discussion/'));
    if (returningFromThread && localStorage[`${app.activeId()}-discussions-scrollY`]) {
      setTimeout(() => {
        window.scrollTo(0, Number(localStorage[`${app.activeId()}-discussions-scrollY`]));
      }, 1);
    }

    if (app.user.unseenPosts[app.activeId()]) {
      app.user.unseenPosts[app.activeId()]['activePosts'] = 0;
      app.user.unseenPosts[app.activeId()]['threads'] = 0;
    }
  },
  oninit: (vnode) => {
    vnode.state.lookback = {};
    const subpage = vnode.attrs.topic || 'allProposals';
    const returningFromThread = (app.lastNavigatedBack() && app.lastNavigatedFrom().includes('/proposal/discussion/'));
    vnode.state.lookback[subpage] = (returningFromThread && localStorage[`${app.activeId()}-lookback-${subpage}`])
      ? localStorage[`${app.activeId()}-lookback-${subpage}`]
      : vnode.state.lookback[subpage]?._isAMomentObject
        ? vnode.state.lookback[subpage]
        : moment();
    vnode.state.topicInitialized = {};
  },
  view: (vnode) => {
    const { topic } = vnode.attrs;
    const activeEntity = app.community ? app.community : app.chain;
    const subpage = topic || 'allProposals';

    // add chain compatibility (node info?)
    if (!activeEntity?.serverLoaded) return m(PageLoading, {
      title: topic || 'Discussions',
      showNewProposalButton: true,
    });

    if (!vnode.state.topicInitialized[subpage]) {
      vnode.state.postsDepleted = false;
      $(window).off('scroll');
      let topic_id;

      // Fetch first page of posts
      if (!vnode.state.lookback[subpage]
        || !vnode.state.lookback[subpage]?._isAMomentObject) {
        vnode.state.lookback[subpage] = moment();
      }
      const args = app.activeCommunityId()
        ? [null, app.activeCommunityId(), vnode.state.lookback[subpage]]
        : [app.activeChainId(), null, vnode.state.lookback[subpage]];
      if (topic) {
        topic_id = app.topics.getByName(topic, app.activeId())?.id;
        if (!topic_id) {
          notifyError('Cannot fetch posts: Improperly configured topics.');
          return m(EmptyTopicPlaceholder, {
            communityName: app.activeId(),
            topicName: topic
          });
        }
        args.push(topic_id);
      }
      (<any>app.threads.loadNextPage)(...args).then((morePostsRemaining) => {
        if (!morePostsRemaining) vnode.state.postsDepleted = true;
        m.redraw();
      });

      // Initialize infiniteScroll
      vnode.state.onscroll = _.debounce(async () => {
        console.log('onscroll state');
        console.log(vnode.state);
        if (vnode.state.postsDepleted) return;
        const args_ = app.activeCommunityId()
          ? [null, app.activeCommunityId(), vnode.state.lookback[subpage]]
          : [app.activeChainId(), null, vnode.state.lookback[subpage]];
        if (topic_id) args_.push(topic_id);
        console.log(args_);
        const scrollHeight = $(document).height();
        const scrollPos = $(window).height() + $(window).scrollTop();
        if (scrollPos > (scrollHeight - 400)) {
          const morePostsRemaining = await (<any>app.threads.loadNextPage)(...args_);
          if (!morePostsRemaining) vnode.state.postsDepleted = true;
          m.redraw();
        }
      }, 400);

      $(window).on('scroll', vnode.state.onscroll);

      vnode.state.topicInitialized[subpage] = true;
    }

    localStorage[`${app.activeId()}-lookback-${subpage}`] = vnode.state.lookback[subpage];

    const activeNode = app.chain?.meta;
    const selectedNodes = app.config.nodes.getAll().filter((n) => activeNode && n.url === activeNode.url
                                       && n.chain && activeNode.chain && n.chain.id === activeNode.chain.id);
    const selectedNode = selectedNodes.length > 0 && selectedNodes[0];
    const selectedCommunity = app.community;

    const communityName = selectedNode
      ? selectedNode.chain.name : selectedCommunity ? selectedCommunity.meta.name : '';

    const allLastVisited = (typeof app.user.lastVisited === 'string')
      ? JSON.parse(app.user.lastVisited)
      : app.user.lastVisited;
    if (!vnode.state.lastVisitedUpdated) {
      vnode.state.lastVisitedUpdated = true;
      updateLastVisited(app.community
        ? (activeEntity.meta as CommunityInfo)
        : (activeEntity.meta as NodeInfo).chain);
    }

    // select the appropriate lastVisited timestamp from the chain||community & convert to Moment
    // for easy comparison with weekly indexes' msecAgo
    const id = (activeEntity.meta as NodeInfo).chain
      ? (activeEntity.meta as NodeInfo).chain.id
      : (activeEntity.meta as CommunityInfo).id;
    const lastVisited = moment(allLastVisited[id]).utc();

    // comparator
    const orderDiscussionsbyLastComment = (a, b) => {
      // tslint:disable-next-line
      const tsB = Math.max(+b.createdAt, +(app.comments.lastCommented(b) || 0));
      const tsA = Math.max(+a.createdAt, +(app.comments.lastCommented(a) || 0));
      return tsB - tsA;
    };

    const orderByDateReverseChronological = (a, b) => {
      // tslint:disable-next-line
      const tsB = Math.max(+b.createdAt);
      const tsA = Math.max(+a.createdAt);
      return tsA - tsB;
    };

    let listing = [];
    const a = app;
    const allThreads = topic
      ? app.threads.topicScopedStore.getByCommunityAndTopic(app.activeId(), topic)
        .sort(orderDiscussionsbyLastComment)
      : app.threads
        .getType(OffchainThreadKind.Forum, OffchainThreadKind.Link)
        .sort(orderDiscussionsbyLastComment);

    if (allThreads.length) {
      let visitMarkerPlaced = false;

      // normal threads
      const sortedThreads = allThreads.filter((t) => !t.pinned);

      const firstThread = sortedThreads[0];
      const lastThread = sortedThreads[sortedThreads.length - 1];

      vnode.state.lookback[subpage] = lastThread.createdAt;

      // pinned threads - inserted at the top of the listing
      const pinnedThreads = allThreads.filter((t) => t.pinned);
      if (pinnedThreads.length > 0) {
        debugger
        listing.push(m(PinnedListing, { proposals: pinnedThreads }));

        if (getLastUpdate(firstThread) > lastVisited) {
          listing.push(getLastSeenDivider(false));
        }
      }

      let count = 0;
      sortedThreads.forEach((proposal) => {
        const row = m(DiscussionRow, { proposal });
        if (!visitMarkerPlaced && getLastUpdate(proposal) < lastVisited) {
          listing = [m('.discussion-group-wrap', listing), getLastSeenDivider(), m('.discussion-group-wrap', [row])];
          visitMarkerPlaced = true;
          count += 1;
        } else {
          if (visitMarkerPlaced) {
            listing[2].children.push(row);
          } else {
            listing.push(row);
          }
          count += 1;
        }
      });
    }

    let topicDescription;
    if (topic && app.activeId()) {
      const topics = app.topics.getByCommunity(app.activeId());
      const topicObject = topics.find((t) => t.name === topic);
      topicDescription = topicObject?.description;
    }

    const stillFetching = (allThreads.length === 0 && vnode.state.postsDepleted === false);
    const emptyTopic = (allThreads.length === 0 && vnode.state.postsDepleted === true);

    return m(Sublayout, {
      class: 'DiscussionsPage',
      title: topic || 'Discussions',
      description: topicDescription,
      showNewProposalButton: true,
      rightSidebar: m(ListingSidebar, { entity: app.activeId() })
    }, [
      (app.chain || app.community) && [
        m('.discussions-main', [
          // m(InlineThreadComposer),
          (!activeEntity || !activeEntity.serverLoaded || stillFetching)
            ? m('.discussions-main', [
              m(ProposalsLoadingRow),
            ])
            : emptyTopic
              // TODO: Ensure that this doesn't get shown on first pass
              ? m(EmptyTopicPlaceholder, { communityName, topicName: topic })
              : m(Listing, {
                content: listing,
                rightColSpacing: [4, 4, 4],
                columnHeaders: [
                  'Title',
                  'Comments',
                  'Likes',
                  'Updated'
                ],
                menuCarat: true,
              }),
          // TODO: Incorporate infinite scroll into generic Listing component
          (allThreads.length && vnode.state.postsDepleted)
            ? m('.infinite-scroll-reached-end', [
              `Showing ${allThreads.length} of ${pluralize(allThreads.length, 'thread')}`,
              (topic ? ` under the topic '${topic}'` : '')
            ])
            : (allThreads.length)
              ? m('.infinite-scroll-spinner-wrap', [
                m(Spinner, { active: !vnode.state.postsDepleted })
              ])
              : null
        ])
      ]
    ]);
  }
}

export default DiscussionsPage;
