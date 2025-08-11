"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_master", {
      EVENT_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        primaryKey: true,
      },
      EVENT_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      EVENT_TYPE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      EVENT_GROUP_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      EXECUTION_DEPARTMENT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      EXECUTION_SECTION_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      PRODUCTION_PROCESS_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      IS_SPLIT_EVENT: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_COMPULSORY: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_AUTO_UPDATED: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_R2P_VALIDATE: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_ACTIVE: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable("event_master");
  },
};
