"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("event_template", {
      TEMPLATE_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        primaryKey: true,
        // autoIncrement: true,
      },
      TEMPLATE_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ORDER_TYPE_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      CTC_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        references: {
          model: "customer_detail",
          key: "CTC_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      CUSTOMER_DIVISION_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "customer_product_division",
          key: "CTPROD_DIVISION_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
    await queryInterface.dropTable("event_template");
  },
};
