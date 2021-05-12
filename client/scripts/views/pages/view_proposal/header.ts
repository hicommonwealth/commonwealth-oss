import m from 'mithril';
import app from 'state';

import { Button, Icon, Icons, Tag, Tooltip, MenuItem, Input } from 'construct-ui';

import {
  pluralize, link, externalLink, extractDomain,
  offchainThreadStageToLabel,
  offchainVoteToLabel,
  slugify,
} from 'helpers';
import {
  proposalSlugToFriendlyName,
  chainEntityTypeToProposalSlug,
  chainEntityTypeToProposalName,
  ProposalType
} from 'identifiers';

import {
  OffchainThread,
  OffchainThreadKind,
  OffchainThreadStage,
  OffchainVoteOptions,
  AnyProposal,
} from 'models';

import { getStatusClass, getStatusText } from 'views/components/proposal_card';
import { notifySuccess } from 'controllers/app/notifications';
import { activeQuillEditorHasText, GlobalStatus } from './body';
import { confirmationModalWithText } from '../../modals/confirm_modal';

export const ProposalHeaderExternalLink: m.Component<{ proposal: AnyProposal | OffchainThread }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal) return;
    if (!(proposal instanceof OffchainThread)) return;
    if (proposal.kind !== OffchainThreadKind.Link) return;
    return m('.ProposalHeaderExternalLink', [
      externalLink('a.external-link', proposal.url, [
        extractDomain(proposal.url),
        m(Icon, { name: Icons.EXTERNAL_LINK }),
      ]),
    ]);
  }
};

export const ProposalHeaderOffchainPoll: m.Component<{ proposal: OffchainThread }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;

    return m('.ProposalHeaderOffchainPoll', [
      m('.offchain-poll-header', 'Poll'),
      [
        OffchainVoteOptions.SUPPORT,
        OffchainVoteOptions.OPPOSE,
        OffchainVoteOptions.CHANGES_REQUESTED,
      ].map((option) => {
        const pollButtonDisabledReason = !app.isLoggedIn() ?
          'Log in to vote'
          : !app.user.activeAccount
          ? 'Connect an address'
          : (proposal.getOffchainVoteFor(app.user.activeAccount.chain.id, app.user.activeAccount.address)
             && proposal.getOffchainVoteFor(app.user.activeAccount.chain.id, app.user.activeAccount.address).option
             === option)
          ? 'Already voted'
          : false;

        const pollButton = m('.poll-button-wrapper', m(Button, {
          rounded: true,
          compact: true,
          size: 'sm',
          intent: 'primary',
          label: 'Vote',
          disabled: !!pollButtonDisabledReason,
          onclick: () => {
            // submit vote
            proposal.submitOffchainVote(
              app.user.activeAccount.chain.id,
              app.user.activeAccount.address,
              option,
            );
          }
        }));

        const pollButtonWrapped = pollButtonDisabledReason ? m(Tooltip, {
          trigger: pollButton,
          content: pollButtonDisabledReason,
          transitionDuration: 0,
          class: 'poll-button-tooltip',
          position: 'right',
        }) : pollButton;

        return m('.offchain-poll-option', [
          m('.offchain-poll-option-left', [
            offchainVoteToLabel(option),
          ]),
          m('.offchain-poll-option-action', pollButtonWrapped),
          m('.offchain-poll-option-right', [
            proposal.offchainVotes.filter((vote) => vote.option === option).length,
            // m(UserGallery)
          ])
        ]);
      })
    ]);
  }
};

export const ProposalHeaderBlockExplorerLink: m.Component<{ proposal: AnyProposal }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal || !proposal['blockExplorerLink']) return;
    return m('.ProposalHeaderBlockExplorerLink', [
      externalLink('a.voting-link', proposal['blockExplorerLink'], [
        proposal['blockExplorerLinkLabel'] || extractDomain(proposal['blockExplorerLink']),
        m(Icon, { name: Icons.EXTERNAL_LINK }),
      ]),
    ]);
  }
};

export const ProposalHeaderVotingInterfaceLink: m.Component<{ proposal: AnyProposal }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal || !proposal['votingInterfaceLink']) return;
    return m('.ProposalHeaderVotingInterfaceLink', [
      externalLink('a.voting-link', proposal['votingInterfaceLink'], [
        proposal['votingInterfaceLinkLabel'] || extractDomain(proposal['votingInterfaceLink']),
        m(Icon, { name: Icons.EXTERNAL_LINK }),
      ]),
    ]);
  }
};

export const ProposalHeaderThreadLink: m.Component<{ proposal: AnyProposal }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal || !proposal.threadId) return;
    return m('.ProposalHeaderThreadLink', [
      link('a.thread-link', `/${proposal['chain'] || app.activeId()}/proposal/discussion/${proposal.threadId}`, [
        'Go to discussion',
        m(Icon, { name: Icons.EXTERNAL_LINK }),
      ]),
    ]);
  }
};

export const ProposalHeaderThreadLinkedChainEntity: m.Component<{ proposal: OffchainThread, chainEntity }> = {
  view: (vnode) => {
    const { proposal, chainEntity } = vnode.attrs;
    const slug = chainEntityTypeToProposalSlug(chainEntity.type);
    if (!slug) return;

    return m('.ProposalHeaderThreadLinkedChainEntity', [
      link(
        'a',
        `/${proposal.chain}/proposal/${slug}/${chainEntity.typeId}`,
        [
          `${chainEntityTypeToProposalName(chainEntity.type)} #${chainEntity.typeId}`,
          chainEntity.completed === 't' ? ' (Completed) ' : ' ',
          m(Icon, { name: Icons.EXTERNAL_LINK }),
        ],
      ),
    ]);
  }
};

export const ProposalHeaderSpacer: m.Component<{}> = {
  view: (vnode) => {
    return m('.ProposalHeaderSpacer', m.trust('&middot;'));
  }
};

export const ProposalHeaderTopics: m.Component<{ proposal: AnyProposal | OffchainThread }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal) return;
    if (!(proposal instanceof OffchainThread)) return;
    if (!proposal.topic) return;

    const topicColor = '#72b483';

    return m('.ProposalHeaderTopics', [
      link('a.proposal-topic', `/${app.activeId()}/discussions/${proposal.topic.name}`, [
        m('span.proposal-topic-name', `${proposal.topic?.name}`),
      ]),
    ]);
  }
};

export const ProposalHeaderTitle: m.Component<{ proposal: AnyProposal | OffchainThread }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal) return;
    return m('.ProposalHeaderTitle', [
      proposal.title,
      (proposal instanceof OffchainThread && proposal.readOnly) && m(Tag, {
        size: 'xs',
        label: [
          m(Icon, { name: Icons.LOCK, size: 'xs' }),
          ' Locked'
        ],
      }),
    ]);
  }
};

export const ProposalHeaderStage: m.Component<{ proposal: OffchainThread }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal) return;
    return m('.ProposalHeaderStage', [
      m(Button, {
        rounded: true,
        compact: true,
        size: 'xs',
        href: `/${proposal.chain || proposal.community}?stage=${proposal.stage}`,
        onclick: (e) => {
          e.preventDefault();
          m.route.set(`/${proposal.chain || proposal.community}?stage=${proposal.stage}`);
        },
        label: offchainThreadStageToLabel(proposal.stage),
        intent: proposal.stage === OffchainThreadStage.Discussion ? 'none'
          : proposal.stage === OffchainThreadStage.ProposalInReview ? 'positive'
            : proposal.stage === OffchainThreadStage.Voting ? 'positive'
              : proposal.stage === OffchainThreadStage.Passed ? 'positive'
                : proposal.stage === OffchainThreadStage.Failed ? 'negative'
                  : proposal.stage === OffchainThreadStage.Abandoned ? 'negative' : 'none',
      }),
    ]);
  }
};

export const ProposalHeaderStageEditorButton: m.Component<{ openStageEditor: Function }, { isOpen: boolean }> = {
  view: (vnode) => {
    const { openStageEditor } = vnode.attrs;
    return m(Button, {
      class: 'ProposalHeaderStageEditorButton',
      rounded: true,
      size: 'xs',
      label: 'Select stage',
      onclick: (e) => {
        e.preventDefault();
        openStageEditor();
      },
    });
  }
};

export const ProposalHeaderPollEditorButton: m.Component<{ openPollEditor: Function }, { isOpen: boolean }> = {
  view: (vnode) => {
    const { openPollEditor } = vnode.attrs;
    return m(Button, {
      class: 'ProposalHeaderPollEditorButton',
      rounded: true,
      size: 'xs',
      label: 'Create poll',
      onclick: (e) => {
        e.preventDefault();
        openPollEditor();
      },
    });
  }
};

export const ProposalHeaderOnchainId: m.Component<{ proposal: AnyProposal }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal) return;
    return m(
      '.ProposalHeaderOnchainId',
      `${proposalSlugToFriendlyName.get(proposal.slug)} ${proposal.shortIdentifier}`
    );
  }
};

export const ProposalHeaderOnchainStatus: m.Component<{ proposal: AnyProposal }> = {
  view: (vnode) => {
    const { proposal } = vnode.attrs;
    if (!proposal) return;
    return m('.ProposalHeaderOnchainStatus', { class: getStatusClass(proposal) }, getStatusText(proposal, true));
  }
};

export const ProposalHeaderViewCount: m.Component<{ viewCount: number }> = {
  view: (vnode) => {
    const { viewCount } = vnode.attrs;
    return m('.ViewCountBlock', pluralize(viewCount, 'view'));
  }
};

export const ProposalTitleEditMenuItem: m.Component<{
  item: AnyProposal, getSetGlobalReplyStatus, getSetGlobalEditingStatus, parentState
}> = {
  view: (vnode) => {
    const { item, getSetGlobalEditingStatus, getSetGlobalReplyStatus, parentState } = vnode.attrs;
    if (!item) return;

    return m(MenuItem, {
      label: 'Edit title',
      class: 'edit-proposal-title',
      onclick: async (e) => {
        e.preventDefault();
        if (getSetGlobalReplyStatus(GlobalStatus.Get)) {
          if (activeQuillEditorHasText()) {
            const confirmed = await confirmationModalWithText('Unsubmitted replies will be lost. Continue?')();
            if (!confirmed) return;
          }
          getSetGlobalReplyStatus(GlobalStatus.Set, false, true);
        }
        parentState.editing = true;
        getSetGlobalEditingStatus(GlobalStatus.Set, true);
      },
    });
  }
};

// Component for saving chain proposal titles
export const ProposalTitleSaveEdit: m.Component<{
  proposal: AnyProposal,
  getSetGlobalEditingStatus,
  parentState,
}> = {
  view: (vnode) => {
    const { proposal, getSetGlobalEditingStatus, parentState } = vnode.attrs;
    if (!proposal) return;
    const proposalLink = `/${app.activeChainId()}/proposal/${proposal.slug}/${proposal.identifier}`
      + `-${slugify(proposal.title)}`;

    return m('.ProposalTitleSaveEdit', [
      m(Button, {
        class: 'save-editing',
        label: 'Save',
        disabled: parentState.saving,
        intent: 'primary',
        rounded: true,
        onclick: (e) => {
          e.preventDefault();
          parentState.saving = true;
          app.chain.chainEntities.updateEntityTitle(proposal.uniqueIdentifier, parentState.updatedTitle).then((response) => {
            m.route.set(proposalLink);
            parentState.editing = false;
            parentState.saving = false;
            getSetGlobalEditingStatus(GlobalStatus.Set, false);
            proposal.title = parentState.updatedTitle;
            m.redraw();
            notifySuccess('Thread successfully edited');
          });
        }
      }, 'Save'),
    ]);
  }
};

export const ProposalTitleCancelEdit: m.Component<{ proposal, getSetGlobalEditingStatus, parentState }> = {
  view: (vnode) => {
    const { proposal, getSetGlobalEditingStatus, parentState } = vnode.attrs;

    return m('.ProposalTitleCancelEdit', [
      m(Button, {
        class: 'cancel-editing',
        label: 'Cancel',
        disabled: parentState.saving,
        intent: 'none',
        rounded: true,
        onclick: async (e) => {
          e.preventDefault();
          parentState.editing = false;
          parentState.saving = false;
          getSetGlobalEditingStatus(GlobalStatus.Set, false);
          m.redraw();
        }
      }, 'Cancel')
    ]);
  }
};

export const ProposalTitleEditor: m.Component<{
  item: OffchainThread | AnyProposal,
  getSetGlobalEditingStatus,
  parentState
}> = {
  oninit: (vnode) => {
    vnode.attrs.parentState.updatedTitle = vnode.attrs.item.title;
  },
  view: (vnode) => {
    const { item, parentState, getSetGlobalEditingStatus } = vnode.attrs;
    if (!item) return;
    const isThread = (item instanceof OffchainThread);

    return m('.ProposalTitleEditor', [
      m(Input, {
        size: 'lg',
        name: 'edit-thread-title',
        autocomplete: 'off',
        oninput: (e) => {
          const { value } = (e as any).target;
          parentState.updatedTitle = value;
        },
        defaultValue: parentState.updatedTitle,
        tabindex: 1,
      }),
      !isThread && m('.proposal-title-buttons', [
        m(ProposalTitleSaveEdit, {
          proposal: (item as AnyProposal), getSetGlobalEditingStatus, parentState
        }),
        m(ProposalTitleCancelEdit, {
          proposal: (item as AnyProposal), getSetGlobalEditingStatus, parentState
        })
      ])
    ]);
  }
};

export const ProposalHeaderPrivacyMenuItems: m.Component<{
  proposal: AnyProposal | OffchainThread,
  getSetGlobalEditingStatus: CallableFunction
}> = {
  view: (vnode) => {
    const { proposal, getSetGlobalEditingStatus } = vnode.attrs;
    if (!proposal) return;
    if (!(proposal instanceof OffchainThread)) return;

    return [
      m(MenuItem, {
        class: 'read-only-toggle',
        onclick: (e) => {
          e.preventDefault();
          app.threads.setPrivacy({
            threadId: proposal.id,
            readOnly: !proposal.readOnly,
          }).then(() => {
            getSetGlobalEditingStatus(GlobalStatus.Set, false);
            m.redraw();
          });
        },
        label: proposal.readOnly ? 'Unlock thread' : 'Lock thread',
      }),
    ];
  }
};
