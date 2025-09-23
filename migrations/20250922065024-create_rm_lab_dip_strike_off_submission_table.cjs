"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("rm_lab_dip_strike_off_submission", {
      ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RM_LAB_STRIKE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      SUBMIT_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      SUBMIT_CODE: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      COMMENT_STATUS: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      OBTAIN_COMMENT: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      COMMENT_NOTE: {
        type: Sequelize.STRING(255),
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
    await queryInterface.dropTable("rm_lab_dip_strike_off_submission");
  },
};
