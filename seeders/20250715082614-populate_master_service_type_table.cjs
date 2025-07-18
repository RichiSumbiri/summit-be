"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_service_type", [
      {
        SERVICE_TYPE_CODE: "VA",
        SERVICE_TYPE_DESCRIPTION: "Value-Added Service",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        SERVICE_TYPE_CODE: "PS",
        SERVICE_TYPE_DESCRIPTION: "Product Material Service",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("master_service_type", null, {});
  }
};

