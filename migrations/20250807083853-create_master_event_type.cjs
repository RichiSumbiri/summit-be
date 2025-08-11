"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("master_event_type", {
      EVENT_TYPE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      EVENT_TYPE_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
    await queryInterface.dropTable("master_event_type");
  },
};
