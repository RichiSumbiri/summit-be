"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_service_category", [
      {
        SERVICE_CATEGORY_CODE: "EMB",
        SERVICE_CATEGORY_DESCRIPTION: "Embroidery",
        SERVICE_TYPE_ID: 1,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "STA",
        SERVICE_CATEGORY_DESCRIPTION: "Strap Assembly",
        SERVICE_TYPE_ID: 1,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "PRN",
        SERVICE_CATEGORY_DESCRIPTION: "Printing",
        SERVICE_TYPE_ID: 1,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "MOD",
        SERVICE_CATEGORY_DESCRIPTION: "Moulding",
        SERVICE_TYPE_ID: 1,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "LMT",
        SERVICE_CATEGORY_DESCRIPTION: "Laminating",
        SERVICE_TYPE_ID: 2,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "LBT",
        SERVICE_CATEGORY_DESCRIPTION: "Label Transfer",
        SERVICE_TYPE_ID: 2,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "FUS",
        SERVICE_CATEGORY_DESCRIPTION: "Fusing",
        SERVICE_TYPE_ID: 2,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "BOD",
        SERVICE_CATEGORY_DESCRIPTION: "Bonding",
        SERVICE_TYPE_ID: 2,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "DYE",
        SERVICE_CATEGORY_DESCRIPTION: "Dyeing",
        SERVICE_TYPE_ID: 2,
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("master_service_category", null, {});
  }
};
