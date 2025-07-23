'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('service_attributes', {
      SERVICE_ATTRIBUTE_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        primaryKey: true
      },
      ATTRIBUTE_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      SERVICE_ATTRIBUTE_GROUP_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SERVICE_ATTRIBUTE_TYPE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SERVICE_ATTRIBUTE_CATEGORY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SERVICE_ITEM_GROUP_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SERVICE_ITEM_TYPE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SERVICE_ITEM_CATEGORY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      IS_ACTIVE: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('service_attributes');
  }
};
