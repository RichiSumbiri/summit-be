"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_event_type", [
      {
        EVENT_TYPE_NAME: "Pre-Production",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        EVENT_TYPE_NAME: "Production",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("master_event_type", null, {});
  }
};
