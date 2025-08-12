import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import Users from "../setup/users.mod.js";
import {FGColorChartModel} from "./colorChart.mod.js";

const sizeChart = db.define(
  "master_size_chart",
  {
    SIZE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    SIZE_CODE: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SIZE_DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: false,
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

export default sizeChart;

sizeChart.belongsTo(Users, {
    foreignKey: "CREATED_BY",
    targetKey: "USER_ID",
    as: "created_by",
});

sizeChart.belongsTo(Users, {
    foreignKey: "UPDATED_BY",
    targetKey: "USER_ID",
    as: "updated_by",
});

export const FGSizeChartModel = db.define(
    "fg_size_chart",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        SIZE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
        deletedAt: "DELETED_AT",
        paranoid: true,
    }
);

FGSizeChartModel.belongsTo(sizeChart, {
    foreignKey: "SIZE_ID",
    as: "SIZE",
});


FGSizeChartModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

FGSizeChartModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})