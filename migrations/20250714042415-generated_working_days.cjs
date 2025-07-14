'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('generated_working_days', {
      GENERATED_WORKING_DAY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      YEAR: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      MONTH: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      ALLOCATED_WORK_DAYS: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SCHEDULING_WORK_DAYS: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      CONFIRMED_FLAG: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      CONFIRMED_DATE: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      CONFIRMED_BY: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      CREATED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      UPDATED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      CREATED_AT: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      UPDATED_AT: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('generated_working_days');
  }
};
