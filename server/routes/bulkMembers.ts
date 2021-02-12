import { Request, Response, NextFunction } from 'express';
import lookupCommunityIsVisibleToUser from '../util/lookupCommunityIsVisibleToUser';
import { factory, formatFilename } from '../../shared/logging';

const log = factory.getLogger(formatFilename(__filename));

const bulkMembers = async (models, req: Request, res: Response, next: NextFunction) => {
  const communityResult = await lookupCommunityIsVisibleToUser(models, req.query, req.user);
  if (typeof communityResult === 'string') return next(new Error(communityResult));
  const [chain, community] = communityResult;

  const members = await models.Role.findAll({
    where: chain ? { chain_id: chain.id } : { offchain_community_id: community.id },
    include: [ models.Address ],
    order: [['created_at', 'DESC']],
  });

  return res.json({ status: 'Success', result: members.map((p) => p.toJSON()) });
};

export default bulkMembers;
