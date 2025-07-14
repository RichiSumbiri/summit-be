'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('calendar_holidays', {
      HOLIDAY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      REASON: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      TYPE: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      HOLIDAY_DATE: {
        type: Sequelize.DATEONLY,
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
    await queryInterface.dropTable('calendar_holidays');
  }
};
