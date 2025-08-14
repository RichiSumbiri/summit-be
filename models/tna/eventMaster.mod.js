import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import MasterEventType from "../system/masterEventType.mod.js";
import MasterEventGroup from "../system/masterEventGroup.mod.js";
import { modelMasterDepartmentFx } from "../setup/departmentFx.mod.js";
import masterProductionProcess from "../system/masterProductionProcess.mod.js";
import eventMasterComment from "./eventMasterComments.mod.js";

const eventMaster = db.define(
  "event_master",
  {
    EVENT_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    EVENT_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    EVENT_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EVENT_GROUP_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EXECUTION_DEPARTMENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EXECUTION_SECTION_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    PRODUCTION_PROCESS_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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

export default eventMaster;

eventMaster.belongsTo(MasterEventType, {
  foreignKey: "EVENT_TYPE_ID",
  targetKey: "EVENT_TYPE_ID",
  as: "event_type",
});
eventMaster.belongsTo(MasterEventGroup, {
  foreignKey: "EVENT_GROUP_ID",
  targetKey: "EVENT_GROUP_ID",
  as: "event_group",
});
eventMaster.belongsTo(modelMasterDepartmentFx, {
  foreignKey: "EXECUTION_DEPARTMENT_ID",
  targetKey: "ID_DEPT",
  as: "department",
});
eventMaster.belongsTo(modelMasterDepartmentFx, {
  foreignKey: "EXECUTION_SECTION_ID",
  targetKey: "ID_DEPT",
  as: "section",
});
eventMaster.belongsTo(masterProductionProcess, {
  foreignKey: "PRODUCTION_PROCESS_ID",
  targetKey: "PRODUCTION_PROCESS_ID",
  as: "production_process",
});
eventMaster.hasMany(eventMasterComment, {
  foreignKey: "EVENT_ID",
  as: "event_master_comments",
});
