import MasterAttributeSetting from "./system/masterAttributeSetting.mod.js"
import MasterAttributeValue from "./system/masterAttributeValue.mod.js"
import SizeChartTemplateModel from "./system/sizeTemplate.mod.js";

MasterAttributeSetting.hasMany(MasterAttributeValue, {
    foreignKey: "MASTER_ATTRIBUTE_ID",
    as: "attributeValues"
});

MasterAttributeValue.belongsTo(MasterAttributeSetting, {
    foreignKey: "MASTER_ATTRIBUTE_ID",
    as: "attributeSetting"
});
