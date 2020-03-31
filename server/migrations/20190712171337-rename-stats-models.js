'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.renameTable('Events', 'StatsEvents', { transaction: t });
      await queryInterface.renameTable('Balances', 'StatsBalances', { transaction: t });
    });
  },

  down: (queryInterface, DataTypes) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.renameTable('StatsEvents', 'Events', { transaction: t });
      await queryInterface.renameTable('StatsBalances', 'Balances', { transaction: t });
    });
  }
};
