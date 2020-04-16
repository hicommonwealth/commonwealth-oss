import { Response, NextFunction } from 'express';
import lookupCommunityIsVisibleToUser from 'server/util/lookupCommunityIsVisibleToUser';
import { NotificationCategories } from '../../shared/types';
import { UserRequest } from '../types';
import { createCommonwealthUrl } from '../util/routeUtils';

const editComment = async (models, req: UserRequest, res: Response, next: NextFunction) => {
  const [chain, community] = await lookupCommunityIsVisibleToUser(models, req.body, req.user, next);

  if (!req.user) {
    return next(new Error('Not logged in'));
  }
  if (!req.body.id) {
    return next(new Error('Must provide id'));
  }

  const attachFiles = async () => {
    if (req.body['attachments[]'] && typeof req.body['attachments[]'] === 'string') {
      await models.OffchainAttachment.create({
        attachable: 'comment',
        attachment_id: req.body.id,
        url: req.body['attachments[]'],
        description: 'image',
      });
    } else if (req.body['attachments[]']) {
      await Promise.all(req.body['attachments[]'].map((u) => models.OffchainAttachment.create({
        attachable: 'comment',
        attachment_id: req.body.id,
        url: u,
        description: 'image',
      })));
    }
  };

  try {
    const userOwnedAddresses = await req.user.getAddresses();
    const comment = await models.OffchainComment.findOne({
      where: { id: req.body.id },
    });

    if (userOwnedAddresses.map((addr) => addr.id).indexOf(comment.address_id) === -1) {
      return next(new Error('Not owned by this user'));
    }
    const arr = comment.version_history;
    arr.unshift(req.body.version_history);
    comment.version_history = arr;
    comment.text = req.body.body;
    await comment.save();
    attachFiles();
    const finalComment = await models.OffchainComment.findOne({
      where: { id: comment.id },
      include: [models.Address, models.OffchainAttachment],
    });
    // get thread for crafting commonwealth url
    let proposal;
    const [prefix, id] = comment.root_id.split('_');
    if (prefix === 'discussion') {
      proposal = await models.OffchainThread.findOne({
        where: { id }
      });
    } else if (prefix.includes('proposal')) {
      proposal = await models.Proposal.findOne({
        where: { id }
      });
    }
    const cwUrl = createCommonwealthUrl(prefix, proposal, comment);

    // dispatch notifications to subscribers of the comment/thread
    await models.Subscription.emitNotifications(
      models,
      NotificationCategories.CommentEdit,
      '',
      {
        created_at: new Date(),
        root_id: Number(proposal.id),
        root_title: proposal.title || '',
        root_type: prefix,
        comment_id: Number(finalComment.id),
        comment_text: finalComment.text,
        chain_id: chain.id,
        community_id: community.id,
        author_address: finalComment.Address.address,
        author_chain: finalComment.Address.chain,
      },
      // don't send webhook notifications for edits
      {
        user: finalComment.Address.address,
        url: cwUrl,
        title: proposal.title || '',
        chain: chain.id,
        community: community.id,
      },
      req.wss,
    );

    return res.json({ status: 'Success', result: finalComment.toJSON() });
  } catch (e) {
    return next(e);
  }
};

export default editComment;
