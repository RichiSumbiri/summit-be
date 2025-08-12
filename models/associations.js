import MasterAttributeSetting from "./system/masterAttributeSetting.mod.js"
import MasterAttributeValue from "./system/masterAttributeValue.mod.js"
import SizeChartTemplateModel from "./system/sizeTemplate.mod.js";
import {MasterItemIdAttributesModel} from "./system/masterItemId.mod.js";

MasterAttributeSetting.hasMany(MasterAttributeValue, {
    foreignKey: "MASTER_ATTRIBUTE_ID",
    as: "attributeValues"
});

MasterAttributeValue.belongsTo(MasterAttributeSetting, {
    foreignKey: "MASTER_ATTRIBUTE_ID",
    as: "attributeSetting"
});

MasterItemIdAttributesModel.belongsTo(MasterAttributeSetting, {
    foreignKey: "MASTER_ATTRIBUTE_ID",
    as: "MASTER_ATTRIBUTE"
})

MasterItemIdAttributesModel.belongsTo(MasterAttributeValue, {
    foreignKey: "MASTER_ATTRIBUTE_VALUE_ID",
    as: "MASTER_ATTRIBUTE_VALUE"
})

