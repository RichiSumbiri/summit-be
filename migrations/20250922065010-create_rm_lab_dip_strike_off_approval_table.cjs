"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("rm_lab_dip_strike_off_approval", {
      ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
      },
      RM_LAB_STRIKE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      SERIES_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      SERIES_NOTE: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      SUBMISSION_DATE: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      COMMENT_EXCPECT_DATE: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      COMMENT_RECIEVED_DATE: {
        type: Sequelize.DATEONLY,
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
    await queryInterface.dropTable("rm_lab_dip_strike_off_approval");
  },
};
