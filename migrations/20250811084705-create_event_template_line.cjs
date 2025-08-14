"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_template_line", {
      TEMPLATE_LINE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TEMPLATE_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        references: {
          model: "event_template",
          key: "TEMPLATE_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      EVENT_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        references: {
          model: "event_master",
          key: "EVENT_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      OFFSET_LINK_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "master_offset_link",
          key: "OFFSET_LINK_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      EVENT_OFFSET_DAYS: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      IS_SPLIT_EVENT: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_COMPULSORY: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_AUTO_UPDATED: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      IS_R2P_VALIDATE: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable("event_template_line");
  },
};
