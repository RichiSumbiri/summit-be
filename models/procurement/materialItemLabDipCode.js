import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const materialItemLabDipCode = db.define(
  "material_items_lab_dip_code",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    BOM_STRUCTURE_SOURCING_DETAIL_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LAB_DIP_CODE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    STATUS_FLAG: {
      type: DataTypes.BOOLEAN,
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

// PurchaseOrderModel.belongsTo(masterItemLabDipCode, {
//     foreignKey: "REV_ID",
//     targetKey: "123123",
//     as: "REV"
// })
