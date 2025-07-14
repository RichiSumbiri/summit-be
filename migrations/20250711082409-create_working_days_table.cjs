'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('working_days', {
      WORKING_DAY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      DAY: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      IS_WORKING_DAY: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      CREATED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      UPDATED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      CREATED_AT: {
        type: Sequelize.DATE,
        allowNull: false
      },
      UPDATED_AT: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('working_days');
  }
};
