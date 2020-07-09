import { Request, Response, NextFunction } from 'express';
import Errors from './errors';
import { factory, formatFilename } from '../../../shared/logging';
import { server } from 'websocket';

const log = factory.getLogger(formatFilename(__filename));

export default async (models, req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new Error(Errors.NotLoggedIn));
  }
  if (!req.body.category || req.body.object_id === undefined) {
    return next(new Error(Errors.NoCategoryAndObjectId));
  }

  const category = await models.NotificationCategory.findOne({
    where: { name: req.body.category }
  });
  if (!category) {
    return next(new Error(Errors.InvalidNotificationCategory));
  }

  let args;
  const parsed_object_id = req.body.object_id.split(/-|_/);
  const p_id = parsed_object_id[1];
  const p_entity = parsed_object_id[0];
  switch (category) {
    case 'new-thread-creation': {
      const chains = await models.Chain.findAll();
      const chainsIds = chains.map((c) => c.id);
      if (chainsIds.includes(req.body.object_id)) {
        args = { chain_id: req.body.object_id };
      } else {
        args = { community_id: req.body.object_id };
      }
      break;
    }
    case 'new-comment-creation' || 'new-reaction':
      if (p_entity === 'discussion') {
        const thread = await models.OffchainThread.findOne({ where: { id: Number(p_id), } });
        if (!thread) return next(new Error(Errors.NoThread));
        if (thread.chain) {
          args = { offchain_thread_id: Number(p_id), chain_id: thread.chain, };
        } else if (thread.community) {
          args = { offchain_thread_id: Number(p_id), community_id: thread.community, };
        }
      } else if (p_entity === 'comment') {
        const comment = await models.OffchainComment.findOne({ where: { id: Number(p_id), } });
        if (!comment) return next(new Error(Errors.NoComment));
        if (comment.chain) {
          args = { offchain_comment_id: Number(p_id), chain_id: comment.chain, };
        } else if (comment.community) {
          args = { offchain_comment_id: Number(p_id), community_id: comment.community, };
        }
      } else {
        return next(new Error(Errors.NoCommentOrReactionEntity));
      }
      break;
    case 'new-mention':
      return next(new Error(Errors.NoMentions));
    case 'chain-event':
      args = { chain_id: p_entity, chain_event_type_id: req.body.object_id };
      break;
    default:
      return next(new Error(Errors.InvalidNotificationCategory));
  }

  const subscription = await models.Subscription.create({
    subscriber_id: req.user.id,
    category_id: req.body.category,
    object_id: req.body.object_id,
    is_active: !!req.body.is_active,
    ...args,
  });

  return res.json({ status: 'Success', result: subscription.toJSON() });
};
