"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_status", [
      {
        STATUS_ID: "SID0000001",
        STATUS_NAME: "Open",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        STATUS_ID: "SID0000010",
        STATUS_NAME: "Rejected",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        STATUS_ID: "SID0000014",
        STATUS_NAME: "Approved",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("master_status", null, {});
  },
};
