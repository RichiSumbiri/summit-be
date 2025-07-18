'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('master_service_category', {
      SERVICE_CATEGORY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      SERVICE_CATEGORY_CODE: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      SERVICE_CATEGORY_DESCRIPTION: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
    await queryInterface.dropTable('master_service_category');
  }
};
