import * as Sequelize from 'sequelize';
import { InviteCodeAttributes } from '../../shared/types';

export interface InviteCodeInstance
extends Sequelize.Instance<InviteCodeAttributes>, InviteCodeAttributes {

}

export interface InviteCodeModel
extends Sequelize.Model<InviteCodeInstance, InviteCodeAttributes> {

}

export default (
  sequelize: Sequelize.Sequelize,
  dataTypes: Sequelize.DataTypes,
): InviteCodeModel => {
  const InviteCode = sequelize.define<InviteCodeInstance, InviteCodeAttributes>('InviteCode', {
    id: { type: dataTypes.STRING, primaryKey: true },
    community_id: { type: dataTypes.STRING, allowNull: true },
    chain_id: { type: dataTypes.STRING, allowNull: true },
    community_name: { type: dataTypes.STRING, allowNull: true },
    creator_id: { type: dataTypes.INTEGER, allowNull: false },
    invited_email: { type: dataTypes.STRING, allowNull: true, defaultValue: null },
    used: { type: dataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['id'], unique: true },
      { fields: ['creator_id'] },
    ],
  });

  InviteCode.associate = (models) => {
    models.InviteCode.belongsTo(models.OffchainCommunity, { foreignKey: 'community_id', targetKey: 'id' });
    models.InviteCode.belongsTo(models.Chain, { foreignKey: 'chain_id', targetKey: 'id' });
  };

  return InviteCode;
};
