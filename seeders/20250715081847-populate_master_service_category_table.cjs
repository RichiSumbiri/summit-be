"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_service_category", [
      {
        SERVICE_CATEGORY_CODE: "EMB",
        SERVICE_CATEGORY_DESCRIPTION: "Embroidery",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "STA",
        SERVICE_CATEGORY_DESCRIPTION: "Strap Assembly",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "PRN",
        SERVICE_CATEGORY_DESCRIPTION: "Printing",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "MOD",
        SERVICE_CATEGORY_DESCRIPTION: "Moulding",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "LMT",
        SERVICE_CATEGORY_DESCRIPTION: "Laminating",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "LBT",
        SERVICE_CATEGORY_DESCRIPTION: "Label Transfer",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "FUS",
        SERVICE_CATEGORY_DESCRIPTION: "Fusing",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "BOD",
        SERVICE_CATEGORY_DESCRIPTION: "Bonding",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_CATEGORY_CODE: "DYE",
        SERVICE_CATEGORY_DESCRIPTION: "Dyeing",
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
