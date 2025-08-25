import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import Users from "../setup/users.mod.js";
import { ModelOrderPOHeader } from "../orderManagement/orderManagement.mod.js";
import eventTemplate from "./eventTemplate.mod.js";

const eventFramework = db.define(
  "event_framework",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ORDER_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    TEMPLATE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    GENERATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    GENERATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

export default eventFramework;

eventFramework.belongsTo(Users, {
  foreignKey: "GENERATED_BY",
  targetKey: "USER_ID",
  as: "generated_by",
});
eventFramework.belongsTo(eventTemplate, {
  foreignKey: "TEMPLATE_ID",
  targetKey: "TEMPLATE_ID",
  as: "event_template",
});
