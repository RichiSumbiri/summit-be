"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("material_items_lab_dip_code", {
      ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BOM_STRUCTURE_SOURCING_DETAIL_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      LAB_DIP_CODE_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      STATUS_FLAG: {
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
    await queryInterface.dropTable("material_items_lab_dip_code");
  },
};
