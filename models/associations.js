import MasterAttributeSetting from "./system/masterAttributeSetting.mod.js";
import MasterAttributeValue from "./system/masterAttributeValue.mod.js";
import SizeChartTemplateModel from "./system/sizeTemplate.mod.js";
import { MasterItemIdAttributesModel } from "./system/masterItemId.mod.js";
import eventFramework from "./tna/eventFramework.mod.js";
import Users from "./setup/users.mod.js";
import { ModelOrderPOHeader } from "./orderManagement/orderManagement.mod.js";
import eventTemplate from "./tna/eventTemplate.mod.js";
import { orderitemSMV } from "./orderManagement/orderitemSMV.mod.js";

MasterAttributeSetting.hasMany(MasterAttributeValue, {
  foreignKey: "MASTER_ATTRIBUTE_ID",
  as: "attributeValues",
});

MasterAttributeValue.belongsTo(MasterAttributeSetting, {
  foreignKey: "MASTER_ATTRIBUTE_ID",
  as: "attributeSetting",
});

MasterItemIdAttributesModel.belongsTo(MasterAttributeSetting, {
  foreignKey: "MASTER_ATTRIBUTE_ID",
  as: "MASTER_ATTRIBUTE",
});

MasterItemIdAttributesModel.belongsTo(MasterAttributeValue, {
  foreignKey: "MASTER_ATTRIBUTE_VALUE_ID",
  as: "MASTER_ATTRIBUTE_VALUE",
});

// =======================
// Order + Event Framework
// =======================
eventFramework.belongsTo(ModelOrderPOHeader, {
  foreignKey: "ORDER_ID",
  targetKey: "ORDER_ID",
  as: "order_po_header",
});

ModelOrderPOHeader.hasOne(eventFramework, {
  foreignKey: "ORDER_ID",
  as: "EVENT_FRAMEWORK",
});

ModelOrderPOHeader.hasMany(orderitemSMV, {
  foreignKey: "ORDER_ID",
  sourceKey: "ORDER_ID",
  as: "ORDER_ITEM_SMV",
});

orderitemSMV.belongsTo(ModelOrderPOHeader, {
  foreignKey: "ORDER_ID",
  targetKey: "ORDER_ID",
  as: "ORDER_HEADER",
});
