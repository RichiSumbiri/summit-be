import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import masterOrderType from "../../models/system/masterOrderType.mod.js";
import {
  CustomerDetail,
  CustomerProductDivision,
} from "../../models/system/customer.mod.js";
import eventTemplateLine from "./eventTemplateLine.mod.js";
import Users from "../setup/users.mod.js";

const eventTemplate = db.define(
  "event_template",
  {
    TEMPLATE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true,
    },
    TEMPLATE_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ORDER_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CTC_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      references: {
        model: "customer_detail",
        key: "CTC_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    CUSTOMER_DIVISION_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "customer_product_division",
        key: "CTPROD_DIVISION_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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

export default eventTemplate;

eventTemplate.belongsTo(masterOrderType, {
  foreignKey: "ORDER_TYPE_ID",
  targetKey: "TYPE_ID",
  as: "order_type",
});
eventTemplate.belongsTo(CustomerDetail, {
  foreignKey: "CTC_ID",
  targetKey: "CTC_ID",
  as: "customer_detail",
});
eventTemplate.belongsTo(CustomerProductDivision, {
  foreignKey: "CUSTOMER_DIVISION_ID",
  targetKey: "CTPROD_DIVISION_ID",
  as: "customer_product_division",
});

eventTemplate.hasMany(eventTemplateLine, {
  foreignKey: "TEMPLATE_ID",
  as: "event_template_lines",
});
eventTemplate.belongsTo(Users, {
  foreignKey: "CREATED_BY",
  targetKey: "USER_ID",
  as: "created_by",
});
eventTemplate.belongsTo(Users, {
  foreignKey: "UPDATED_BY",
  targetKey: "USER_ID",
  as: "updated_by",
});