"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_item_smv_detail", {
      ITEM_SMV_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FG_ITEM_ID: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      PRODUCTION_PROCESS_ID: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      DEFAULT_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      COSTING_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      PLAN_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      ACTUAL_SMV: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
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

    // await queryInterface.addConstraint("product_item_smv_detail", {
    //   fields: ["FG_ITEM_ID"],
    //   type: "foreign key",
    //   name: "fk_smv_fg_item",
    //   references: {
    //     table: "product_items",
    //     field: "FG_ITEM_ID",
    //   },
    //   onUpdate: "CASCADE",
    //   onDelete: "CASCADE",
    // });

    // await queryInterface.addConstraint("product_item_smv_detail", {
    //   fields: ["PROCESS_CODE"],
    //   type: "foreign key",
    //   name: "fk_smv_process_code",
    //   references: {
    //     table: "process_stages",
    //     field: "PROCESS_CODE",
    //   },
    //   onUpdate: "CASCADE",
    //   onDelete: "RESTRICT",
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("product_item_smv_detail");
  },
};
