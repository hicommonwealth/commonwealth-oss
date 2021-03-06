import * as Sequelize from 'sequelize';

import { AddressInstance, AddressAttributes } from './address';
import { ChainAttributes } from './chain';
import { ChainNodeInstance, ChainNodeAttributes } from './chain_node';
import { SocialAccountInstance, SocialAccountAttributes } from './social_account';

export type EmailNotificationInterval = 'daily' | 'never';

export interface UserAttributes {
  id?: number;
  email: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
  lastVisited?: string;
  disableRichText?: boolean;
  emailNotificationInterval: EmailNotificationInterval;
  magicIssuer?: string;
  lastMagicLoginAt?: number;
  created_at?: Date;
  updated_at?: Date;

  // associations (see https://vivacitylabs.com/setup-typescript-sequelize/)
  selectedNode?: ChainNodeAttributes | ChainNodeAttributes['id'];
  Addresses?: AddressAttributes[] | AddressAttributes['id'][];
  SocialAccounts?: SocialAccountAttributes[] | SocialAccountAttributes['id'][];
  Chains?: ChainAttributes[] | ChainAttributes['id'][];
}

export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {
  getSelectedNode: Sequelize.BelongsToGetAssociationMixin<ChainNodeInstance>;
  setSelectedNode: Sequelize.BelongsToSetAssociationMixin<ChainNodeInstance, ChainNodeInstance['id']>;

  hasAddresses: Sequelize.HasManyHasAssociationsMixin<AddressInstance, AddressInstance['id']>;
  getAddresses: Sequelize.HasManyGetAssociationsMixin<AddressInstance>;
  setAddresses: Sequelize.HasManySetAssociationsMixin<AddressInstance, AddressInstance['id']>;

  getSocialAccounts: Sequelize.HasManyGetAssociationsMixin<SocialAccountInstance>;
  setSocialAccounts: Sequelize.HasManySetAssociationsMixin<SocialAccountInstance, SocialAccountInstance['id']>;
}

export interface UserModel extends Sequelize.Model<UserInstance, UserAttributes> {

}

export default (
  sequelize: Sequelize.Sequelize,
  dataTypes: Sequelize.DataTypes,
): UserModel => {
  const User = sequelize.define<UserInstance, UserAttributes>('User', {
    id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: dataTypes.STRING },
    emailVerified: { type: dataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    emailNotificationInterval: {
      type: dataTypes.ENUM,
      values: ['daily', 'never'],
      defaultValue: 'never',
      allowNull: false,
    },
    isAdmin: { type: dataTypes.BOOLEAN, defaultValue: false },
    lastVisited: { type: dataTypes.TEXT, allowNull: false, defaultValue: '{}' },
    disableRichText: { type: dataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    magicIssuer: { type: dataTypes.STRING, allowNull: true },
    lastMagicLoginAt: { type: dataTypes.INTEGER, allowNull: true },
    created_at: { type: dataTypes.DATE, allowNull: false },
    updated_at: { type: dataTypes.DATE, allowNull: false },
  }, {
    underscored: true,
    indexes: [
      { fields: ['email'], unique: true },
    ],
    defaultScope: {
      attributes: {
        exclude: [
          'email', 'emailVerified', 'emailNotificationInterval', 'isAdmin',
          'magicIssuer', 'lastMagicLoginAt', 'created_at', 'updated_at'
        ],
      }
    },
    scopes: {
      withPrivateData: {
        attributes: {},
      }
    },
  });

  User.associate = (models) => {
    models.User.belongsTo(models.ChainNode, { as: 'selectedNode', constraints: false });
    models.User.hasMany(models.Address);
    models.User.hasMany(models.SocialAccount);
    models.User.hasMany(models.StarredCommunity);
    models.User.belongsToMany(models.Chain, { through: models.WaitlistRegistration });
  };

  return User;
};
