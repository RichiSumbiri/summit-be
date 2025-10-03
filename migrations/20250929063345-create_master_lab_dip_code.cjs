"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("master_lab_dip_code", {
      ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        primaryKey: true,
      },
      CODE: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      IS_ACTIVE: {
        type: Sequelize.BOOLEAN,
        default: false,
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
    await queryInterface.dropTable("master_lab_dip_code");
  },
};
