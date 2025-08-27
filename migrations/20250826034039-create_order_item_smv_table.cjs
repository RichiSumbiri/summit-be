"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("order_item_smv", {
      ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ORDER_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      FG_ITEM_ID: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      PRODUCTION_PROCESS_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      DEFAULT_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      COSTING_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      PLAN_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      ACTUAL_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable("order_item_smv");
  },
};
