"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("service_attribute_values", {
      SERVICE_ATTRIBUTE_VALUE_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        primaryKey: true,
      },
      SERVICE_ATTRIBUTE_VALUE_CODE: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      SERVICE_ATTRIBUTE_VALUE_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      SERVICE_ATTRIBUTE_ID: {
        type: Sequelize.STRING(20),
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
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("service_attribute_values");
  },
};
