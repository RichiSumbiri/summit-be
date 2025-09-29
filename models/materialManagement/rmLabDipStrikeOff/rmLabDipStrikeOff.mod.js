import { DataTypes } from "sequelize";
import db from "../../../config/database.js";
import { RMLabDipStrikeOffApproval } from "./rmLabDipStrikeOffApproval.mod.js";
import { RMLabDipStrikeOffStyle } from "./rmLabDipStrikeOffStyle.mod.js";
import { RMLabDipStrikeOffSubmission } from "./rmLabDipStrikeOffSubmission.mod.js";
import Users from "../../setup/users.mod.js";
import { ModelVendorDetail } from "../../system/VendorDetail.mod.js";
import { MasterItemGroup } from "../../setup/ItemGroups.mod.js";
import { MasterItemTypes } from "../../setup/ItemTypes.mod.js";
import { MasterItemCategories } from "../../setup/ItemCategories.mod.js";
import MasterItemIdModel from "../../system/masterItemId.mod.js";
import MasterItemDimensionModel from "../../system/masterItemDimention.mod.js";
import {
  CustomerDetail,
  CustomerProductDivision,
  CustomerProductSeason,
  CustomerProgramName,
} from "../../system/customer.mod.js";

export const RMLabDipStrikeOff = db.define(
  "rm_lab_dip_strike_off",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    STATUS: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    CODE: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    IS_LAB_DIPS: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    IS_STRIKE_OFF: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    EXPIRED_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    ITEM_GROUP_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ITEM_TYPE_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ITEM_CATEGORY_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    MATERIAL_ITEM_ID: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    DIM_ID: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    PANTONE_COLOR: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    CUSTOMER_ID: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    DIVISION_ID: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    SEASON_ID: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    PROGRAM_ID: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    VENDOR_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    VENDOR_REF: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    CUSTOMER_NOTE: {
      type: DataTypes.STRING(255),
      allowNull: true,
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

RMLabDipStrikeOff.belongsTo(Users, {
  foreignKey: "COMPLETED_BY",
  targetKey: "USER_ID",
  as: "completed_by",
});

RMLabDipStrikeOff.belongsTo(Users, {
  foreignKey: "CREATED_BY",
  targetKey: "USER_ID",
  as: "created_by",
});

RMLabDipStrikeOff.hasMany(RMLabDipStrikeOffStyle, {
  foreignKey: "RM_LAB_STRIKE_ID",
  as: "styles",
});
RMLabDipStrikeOff.hasMany(RMLabDipStrikeOffApproval, {
  foreignKey: "RM_LAB_STRIKE_ID",
  as: "approvals",
});




RMLabDipStrikeOff.belongsTo(MasterItemGroup, {
  foreignKey: "ITEM_GROUP_ID",
  targetKey: "ITEM_GROUP_ID",
  as: "group",
});
RMLabDipStrikeOff.belongsTo(MasterItemTypes, {
  foreignKey: "ITEM_TYPE_ID",
  targetKey: "ITEM_TYPE_ID",
  as: "type",
});
RMLabDipStrikeOff.belongsTo(MasterItemCategories, {
  foreignKey: "ITEM_CATEGORY_ID",
  targetKey: "ITEM_CATEGORY_ID",
  as: "category",
});

RMLabDipStrikeOff.belongsTo(MasterItemIdModel, {
  foreignKey: "MATERIAL_ITEM_ID",
  targetKey: "ITEM_ID",
  as: "material",
});
RMLabDipStrikeOff.belongsTo(MasterItemDimensionModel, {
  foreignKey: "DIM_ID",
  targetKey: "ID",
  as: "dim",
});

RMLabDipStrikeOff.belongsTo(CustomerDetail, {
  foreignKey: "CUSTOMER_ID",
  targetKey: "CTC_ID",
  as: "customer",
});
RMLabDipStrikeOff.belongsTo(CustomerProductDivision, {
  foreignKey: "DIVISION_ID",
  targetKey: "CTPROD_DIVISION_ID",
  as: "division",
});
RMLabDipStrikeOff.belongsTo(CustomerProductSeason, {
  foreignKey: "SEASON_ID",
  targetKey: "CTPROD_SESION_ID",
  as: "season",
});
RMLabDipStrikeOff.belongsTo(CustomerProgramName, {
  foreignKey: "PROGRAM_ID",
  targetKey: "CTPROG_ID",
  as: "program",
});
RMLabDipStrikeOff.belongsTo(ModelVendorDetail, {
  foreignKey: "VENDOR_ID",
  targetKey: "VENDOR_ID",
  as: "vendor",
});
