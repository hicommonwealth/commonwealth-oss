'use strict';

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.bulkInsert('Chains', [{
      id: 'cosmos',
      symbol: 'ATOM',
      name: 'Cosmos',
    }, {
      id: 'maker',
      symbol: 'MKR',
      name: 'Maker',
    }, {
      id: 'tezos',
      symbol: 'XTZ',
      name: 'Tezos',
    }, {
      id: 'polkadot',
      symbol: 'DOT',
      name: 'Polkadot',
    }, {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
    }]);
  },

  down: (queryInterface, DataTypes) => {
    return queryInterface.bulkDelete('Chains', { '$or': [{
      name: 'Cosmos'
    }, {
      name: 'Maker'
    }, {
      name: 'Tezos'
    }, {
      name: 'Polkadot'
    }, {
      name: 'Ethereum'
    }] });
  }
};
