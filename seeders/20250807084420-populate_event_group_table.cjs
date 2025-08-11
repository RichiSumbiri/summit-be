"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("master_event_group", [
      {
        EVENT_GROUP_NAME: "Approval Events",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        EVENT_GROUP_NAME: "Miscellaneous Events",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        EVENT_GROUP_NAME: "Sample Events",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        EVENT_GROUP_NAME: "Sourcing Events",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
      {
        EVENT_GROUP_NAME: "Submission Events",
        CREATED_BY: 0,
        UPDATED_BY: 0,
        CREATED_AT: new Date(),
        UPDATED_AT: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("master_event_group", null, {});
  },
};
