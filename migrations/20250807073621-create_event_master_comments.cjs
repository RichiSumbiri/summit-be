"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_master_comments", {
      EVENT_COMMENT_ID: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      COMMENT_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      COMMENT_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      EVENT_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      IS_COMPULSORY: {
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
    await queryInterface.dropTable("event_master_comments");
  },
};
