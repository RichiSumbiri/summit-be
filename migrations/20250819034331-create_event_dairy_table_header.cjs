"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_diary_header", {
      EVENT_DIARY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ORDER_PO_ID: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      EVENT_ID: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      ORDER_ID: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      EVENT_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      EVENT_NOTE: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      EVENT_STATUS: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      COMMITMENT_DATE: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      COMPLETED_AT: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      COMPLETED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable("event_diary_header");
  },
};
