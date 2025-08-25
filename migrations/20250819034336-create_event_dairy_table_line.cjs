"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_diary_line", {
      EVENT_DIARY_LINE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      EVENT_DIARY_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "event_diary_header",
          key: "EVENT_DIARY_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      COMMENT_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      POTENTIAL_THREAT: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      RECOMENDATION: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      COMMITMENT_DATE: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      ACTION_TAKEN: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      IS_COMPULSORY: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      COMPLETED_STATUS: {
        type: Sequelize.STRING(100),
        allowNull: false,
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
    await queryInterface.dropTable("event_diary_line");
  },
};
