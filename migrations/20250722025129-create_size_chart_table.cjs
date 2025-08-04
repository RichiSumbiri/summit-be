"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("master_size_chart", {
      SIZE_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        primaryKey: true,
      },
      SIZE_CODE: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      SIZE_DESCRIPTION: {
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
    await queryInterface.dropTable("master_size_chart");
  },
};
