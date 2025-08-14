"use strict";

const { OFFSET } = require("tedious/lib/packet");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("master_offset_link", {
      OFFSET_LINK_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      OFFSET_LINK_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      IS_SPLIT_EVENT: {
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
    await queryInterface.dropTable("master_offset_link");
  },
};
