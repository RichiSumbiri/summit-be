import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const masterItemLabDipCode = db.define(
  "master_lab_dip_code",
  {
    ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    CODE: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    IS_ACTIVE: {
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
