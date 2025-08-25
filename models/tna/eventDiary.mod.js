import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import Users from "../setup/users.mod.js";

//diary headr
export const EventDiaryHeader = db.define(
  "event_diary_header",
  {
    EVENT_DIARY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ORDER_PO_ID: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    EVENT_ID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ORDER_ID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    EVENT_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    EVENT_NOTE: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    EVENT_STATUS: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    COMMITMENT_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    COMPLETED_AT: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    COMPLETED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

EventDiaryHeader.belongsTo(Users, {
  foreignKey: "COMPLETED_BY",
  targetKey: "USER_ID",
  as: "completed_by",
});

// diary line
export const EventDiaryLine = db.define(
  "event_diary_line",
  {
    EVENT_DIARY_LINE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    EVENT_DIARY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    COMMENT_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    POTENTIAL_THREAT: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    RECOMENDATION: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    COMMITMENT_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ACTION_TAKEN: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    IS_COMPULSORY: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    COMPLETED_STATUS: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    COMPLETED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    COMPLETED_AT: {
      type: DataTypes.DATE,
      allowNull: true,
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

EventDiaryHeader.hasMany(EventDiaryLine, {
  foreignKey: "EVENT_DIARY_ID",
  as: "event_diary_lines",
});

EventDiaryLine.belongsTo(Users, {
  foreignKey: "CREATED_BY",
  targetKey: "USER_ID",
  as: "created_by",
});

EventDiaryLine.belongsTo(Users, {
  foreignKey: "COMPLETED_BY",
  targetKey: "USER_ID",
  as: "completed_by",
});
