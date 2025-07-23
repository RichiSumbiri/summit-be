"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_service_group", [
      {
        SERVICE_GROUP_CODE: "SR",
        SERVICE_GROUP_DESCRIPTION: "Services",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("master_service_group", null, {});
  }
};
