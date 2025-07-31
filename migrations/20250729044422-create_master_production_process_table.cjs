"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("master_production_process", {
      PRODUCTION_PROCESS_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      PRODUCTION_PROCESS_CODE: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      PRODUCTION_PROCESS_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      IS_DEFAULT: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      CREATED_AT: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      CREATED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      UPDATED_AT: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      UPDATED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      DELETED_AT: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      DELETED_BY: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("master_production_process");
  },
};
