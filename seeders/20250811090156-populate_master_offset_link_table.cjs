"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_offset_link", [
      {
        OFFSET_LINK_NAME: "Customer PO Confirmed Date",
        IS_SPLIT_EVENT: 1,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        OFFSET_LINK_NAME: "Customer PO Delivery Date",
        IS_SPLIT_EVENT: 1,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        OFFSET_LINK_NAME: "Customer PO Ex-Factory Date",
        IS_SPLIT_EVENT: 1,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },

      {
        OFFSET_LINK_NAME: "Order (Style) Confirmed Date",
        IS_SPLIT_EVENT: 0,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        OFFSET_LINK_NAME: "Earliest Customer PO Delivery Date",
        IS_SPLIT_EVENT: 0,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        OFFSET_LINK_NAME: "Earliest Customer PO Ex-Factory Date",
        IS_SPLIT_EVENT: 0,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        OFFSET_LINK_NAME: "Plan Cut Date (PCD)",
        IS_SPLIT_EVENT: 0,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        OFFSET_LINK_NAME: "Plan Sewing Date (PSD)",
        IS_SPLIT_EVENT: 0,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("master_offset_link", null, {});
  },
};
