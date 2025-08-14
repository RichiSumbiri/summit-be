import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import Users from "../setup/users.mod.js";

const masterOffsetLink = db.define(
  "master_offset_link",
  {
    OFFSET_LINK_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    OFFSET_LINK_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    IS_SPLIT_EVENT: {
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

export default masterOffsetLink;

// sizeChart.belongsTo(Users, {
//   foreignKey: "CREATED_BY",
//   targetKey: "USER_ID",
//   as: "created_by",
// });

// sizeChart.belongsTo(Users, {
//   foreignKey: "UPDATED_BY",
//   targetKey: "USER_ID",
//   as: "updated_by",
// });
