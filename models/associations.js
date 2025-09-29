import MasterAttributeSetting from "./system/masterAttributeSetting.mod.js";
import MasterAttributeValue from "./system/masterAttributeValue.mod.js";
import { MasterItemIdAttributesModel } from "./system/masterItemId.mod.js";
import eventFramework from "./tna/eventFramework.mod.js";
import { ModelOrderPOHeader } from "./orderManagement/orderManagement.mod.js";
import { orderitemSMV } from "./orderManagement/orderitemSMV.mod.js";
import {MecListMachine} from "./mechanics/machines.mod.js";
import {StorageInventoryNodeModel} from "./storage/storageInventory.mod.js";
import {PurchaseOrderModel, PurchaseOrderNotesModel} from "./procurement/purchaseOrder.mod.js";

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


PurchaseOrderModel.hasMany(PurchaseOrderNotesModel, {
  foreignKey: 'PURCHASE_ORDER_ID',
  as: 'NOTES'
});


StorageInventoryNodeModel.hasOne(MecListMachine, {
  foreignKey: 'STORAGE_INVENTORY_NODE_ID',
  as: 'MACHINE'
});