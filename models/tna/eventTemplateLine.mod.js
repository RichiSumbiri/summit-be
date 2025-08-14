import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import eventMaster from "../tna/eventMaster.mod.js"
import masterOffsetLink from "../system/masterOffsetLink.mod.js";

const eventTemplateLine = db.define(
  "event_template_line",
  {
    TEMPLATE_LINE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    TEMPLATE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      references: {
        model: "event_template",
        key: "TEMPLATE_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    EVENT_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      references: {
        model: "event_master",
        key: "EVENT_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    OFFSET_LINK_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "master_offset_link",
        key: "OFFSET_LINK_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    EVENT_OFFSET_DAYS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    IS_SPLIT_EVENT: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    IS_COMPULSORY: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    IS_AUTO_UPDATED: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    IS_R2P_VALIDATE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

export default eventTemplateLine;

eventTemplateLine.belongsTo(eventMaster, {
  foreignKey: "EVENT_ID",
  targetKey: "EVENT_ID",
  as: "event_master",
});

eventTemplateLine.belongsTo(masterOffsetLink, {
  foreignKey: "OFFSET_LINK_ID",
  targetKey: "OFFSET_LINK_ID",
  as: "master_offset_link",
});
