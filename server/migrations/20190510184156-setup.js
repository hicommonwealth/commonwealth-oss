'use strict';

// Initialize database to state as of May 10, 2019

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {

      await queryInterface.createTable('Chains', {
        id: { type: Sequelize.STRING, primaryKey: true }, // autogenerated
        name: { type: Sequelize.STRING, allowNull: false },
        symbol: { type: Sequelize.STRING, allowNull: false },
        icon_url: { type: Sequelize.STRING },
      }, { transaction: t });

      await queryInterface.createTable('Addresses', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, // autogenerated
        address: { type: Sequelize.STRING, allowNull: false },
        chain: { type: Sequelize.STRING, allowNull: false, references: { model: 'Chains', key: 'id' } },
        selected: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      }, { transaction: t });

      await queryInterface.createTable('ChainNodes', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, // autogenerated
        chain: { type: Sequelize.STRING, allowNull: false, references: { model: 'Chains', key: 'id' } },
        url: { type: Sequelize.STRING, allowNull: false },
        port: { type: Sequelize.INTEGER, allowNull: false },
        chain_id: { type: Sequelize.STRING, references: { model: 'Chains', key: 'id' } }, // removed
      }, { transaction: t });

      await queryInterface.createTable('Comments', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, // autogenerated
        chain: { type: Sequelize.STRING, allowNull: false, references: { model: 'Chains', key: 'id' } },
        object_id: { type: Sequelize.STRING, allowNull: false },
        address_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Addresses', key: 'id' } },
        text: { type: Sequelize.TEXT, allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
        deleted_at: Sequelize.DATE,
      }, { transaction: t });

      await queryInterface.createTable('LoginTokens', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, // autogenerated
        token: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false },
        expires: { type: Sequelize.DATE, allowNull: false },
        used: { type: Sequelize.DATE },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      }, { transaction: t });

      await queryInterface.createTable('OffchainThreads', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, // autogenerated
        author_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Addresses', key: 'id' } },
        title: { type: Sequelize.TEXT, allowNull: false },
        body: { type: Sequelize.TEXT, allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
        deleted_at: Sequelize.DATE,
      }, { transaction: t });

      await queryInterface.createTable('Users', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, // autogenerated
        email: { type: Sequelize.STRING },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
        login_token_id: { type: Sequelize.INTEGER, references: { model: 'LoginTokens', key: 'id' } }, // removed
      }, { transaction: t });

      await queryInterface.createTable('SocialAccounts', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, // autogenerated
        provider: { type: Sequelize.STRING },
        provider_username: { type: Sequelize.STRING },
        provider_userid: { type: Sequelize.STRING },
        access_token: { type: Sequelize.STRING },
        refresh_token: { type: Sequelize.STRING },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
        login_token_id: { type: Sequelize.INTEGER, references: { model: 'LoginTokens', key: 'id' } }, // autogenerated
        user_id: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' } },
      }, { transaction: t });

      await queryInterface.addColumn('Addresses', 'user_id', {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
      }, { transaction: t });

      await queryInterface.addColumn('Addresses', 'chain_id', {
        type: Sequelize.STRING,
        references: { model: 'Chains', key: 'id' }, // removed
      }, { transaction: t });
    });
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addIndex('SocialAccounts', { fields: ['user_id'] }, { transaction: t });
      await queryInterface.addIndex('SocialAccounts', { fields: ['user_id', 'provider'] }, { transaction: t });

      await queryInterface.addIndex('Users', { fields: ['email'] }, { transaction: t });

      await queryInterface.addIndex('Addresses', { fields: ['address', 'chain'], unique: true }, { transaction: t });
      await queryInterface.addIndex('Addresses', { fields: ['user_id'] }, { transaction: t });

      await queryInterface.addIndex('ChainNodes', { fields: ['chain'] }, { transaction: t });

      await queryInterface.addIndex('Comments', { fields: ['id'] }, { transaction: t });
      await queryInterface.addIndex('Comments', { fields: ['chain', 'object_id'] }, { transaction: t });
      await queryInterface.addIndex('Comments', { fields: ['address_id'] }, { transaction: t });

      await queryInterface.addIndex('LoginTokens', { fields: ['token', 'email'] }, { transaction: t });

      await queryInterface.addIndex('OffchainThreads', { fields: ['author_id'] }, { transaction: t });
    });

    return new Promise((resolve, reject) => {
      resolve();
    });
  },
  down: (queryInterface, Sequelize) => {
    return new Promise((resolve, reject) => {
      throw new Error('Cannot undo first migration');
      // return queryInterface.sequelize.transaction((t) => {
      //   return Promise.all([
      //     queryInterface.dropTable('SocialAccounts', { transaction: t }),
      //     queryInterface.dropTable('Users', { transaction: t }),
      //     queryInterface.dropTable('Addresses', { transaction: t }),
      //     queryInterface.dropTable('Chains', { transaction: t }),
      //     queryInterface.dropTable('ChainNodes', { transaction: t }),
      //     queryInterface.dropTable('Comments', { transaction: t }),
      //     queryInterface.dropTable('LoginTokens', { transaction: t }),
      //     queryInterface.dropTable('OffchainThreads', { transaction: t }),
      //   ]);
p      // });
    });
  }
};
