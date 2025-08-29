import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import Users from "../setup/users.mod.js";

const EventDiaryRevision = db.define(
  "event_diary_revision",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    EVENT_DIARY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EVENT_REV_ID: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    COMMITMENT_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    NOTE: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DELETED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
    deletedAt: "DELETED_AT",
    paranoid: true,
  }
);
export default EventDiaryRevision;

EventDiaryRevision.belongsTo(Users, {
  foreignKey: "CREATED_BY",
  targetKey: "USER_ID",
  as: "created_by",
});
