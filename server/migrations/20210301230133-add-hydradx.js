'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkInsert('Chains', [{
        id: 'hydradx',
        symbol: 'HDX',
        name: 'HydraDX',
        icon_url: '/static/img/protocols/hydradx.png',
        type: 'chain',
        network: 'hydradx',
        active: true,
        description: 'Cross-chain liquidity protocol built on Substrate.',
        telegram: 'https://t.me/hydradx',
        website: 'https://hydradx.io/',
        github: 'https://github.com/galacticcouncil',
        collapsed_on_homepage: false,
      }], { transaction: t });

      await queryInterface.bulkInsert('ChainNodes', [{
        chain: 'hydradx',
        url: 'wss://hack.hydradx.io:9944/',
      }], { transaction: t });
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkDelete('OffchainReactions', { chain: 'hydradx' }, { transaction: t });
      await queryInterface.bulkDelete('OffchainComments', { chain: 'hydradx' }, { transaction: t });
      await queryInterface.bulkDelete('OffchainThreads', { chain: 'hydradx' }, { transaction: t });
      await queryInterface.bulkDelete('Addresses', { chain: 'hydradx' }, { transaction: t });
      await queryInterface.bulkDelete('ChainEventTypes', { chain: 'hydradx' }, { transaction: t });
      await queryInterface.bulkDelete('ChainNodes', { chain: 'hydradx' }, { transaction: t });
      await queryInterface.bulkDelete('Chains', { id: ['hydradx'] }, { transaction: t });
    });
  }

};
