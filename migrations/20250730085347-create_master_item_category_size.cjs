"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("master_item_category_size", {
      ITEM_CATEGORY_SIZE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      SIZE_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      ITEM_GROUP_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ITEM_TYPE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ITEM_CATEGORY_ID: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("master_item_category_size");
  },
};
