"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_diary_revision", {
      ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      EVENT_DIARY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      EVENT_REV_ID: {
        type: Sequelize.STRING(25),
        allowNull: true,
      },
      COMMITMENT_DATE: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      NOTE: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
    await queryInterface.dropTable("event_diary_revision");
  },
};
