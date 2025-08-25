"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_framework", {
      ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ORDER_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        references: {
          model: "order_po_header",
          key: "ORDER_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
      GENERATED_AT: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      GENERATED_BY: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("event_framework");
  },
};
