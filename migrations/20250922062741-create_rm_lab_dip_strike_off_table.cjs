"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("rm_lab_dip_strike_off", {
      ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      STATUS: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      CODE: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      IS_LAB_DIPS: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_STRIKE_OFF: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      EXPIRED_DATE: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      ITEM_GROUP_ID: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      ITEM_TYPE_ID: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      ITEM_CATEGORY_ID: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      MATERIAL_ITEM_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      DIM_ID: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      PANTONE_COLOR: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },


      CUSTOMER_ID: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      DIVISION_ID: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      SEASON_ID: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      PROGRAM_ID: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      VENDOR_ID: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      VENDOR_REF: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      CUSTOMER_NOTE: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      COMPLETED_AT: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      COMPLETED_BY: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    await queryInterface.dropTable("rm_lab_dip_strike_off");
  },
};
