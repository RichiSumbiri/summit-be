import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import Users from "../setup/users.mod.js";

const colorChart = db.define(
  "master_color_chart",
  {
    COLOR_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    COLOR_CODE: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    COLOR_DESCRIPTION: {
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
      allowNull: true,
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

export default colorChart;

colorChart.belongsTo(Users, {
    foreignKey: "CREATED_BY",
    targetKey: "USER_ID",
    as: "created_by",
});

colorChart.belongsTo(Users, {
    foreignKey: "UPDATED_BY",
    targetKey: "USER_ID",
    as: "updated_by",
});



// colorChart.belongsTo(MasterItemCategories, {
//     foreignKey: "ITEM_CATEGORY_ID",
//     targetKey: "ITEM_CATEGORY_ID",
//     as: "item_categories",
// });

// colorChart.belongsTo(MasterItemTypes, {
//     foreignKey: "ITEM_TYPE_ID",
//     targetKey: "ITEM_TYPE_ID",
//     as: "item_types",
// });

// colorChart.belongsTo(MasterItemGroup, {
//     foreignKey: "ITEM_GROUP_ID",
//     targetKey: "ITEM_GROUP_ID",
//     as: "item_groups",
// });


export const FGColorChartModel = db.define(
    "fg_color_chart",
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
        COLOR_ID: {
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

FGColorChartModel.belongsTo(colorChart, {
    foreignKey: "COLOR_ID",
    as: "COLOR",
});

FGColorChartModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

FGColorChartModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})