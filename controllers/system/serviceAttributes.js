import db from "../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import serviceAttributes, {
  QueryGetServiceAttributes,
  QueryGetServiceAttributesDropdown, QueryGetServiceAttributesParam,
} from "../../models/system/serviceAttributes.mod.js";
import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import MasterServiceCategories from "../../models/setup/ServiceCategories.mod.js";
import MasterServiceTypes from "../../models/setup/ServiceTypes.mod.js";
import MasterServiceGroups from "../../models/setup/ServiceGroups.mod.js";

export const getServiceAttributes = async (req, res) => {
  try {
    const serviceAttributes = await db.query(QueryGetServiceAttributes, {
      type: QueryTypes.SELECT,
    });

    res.status(200).json(serviceAttributes);
  } catch (err) {
    res.status(404).json({
      message: "Action Problem With Get Service Attributes Data",
      data: err.message,
    });
  }
};

export const getServiceAttributesParam = async (req, res) => {
  const {ITEM_GROUP_ID, ITEM_TYPE_ID, ITEM_CATEGORY_ID} = req.query
  try {
    const where = {}

    if (ITEM_GROUP_ID) {
      where.ITEM_GROUP_ID = ITEM_GROUP_ID
    }

    if (ITEM_TYPE_ID) {
      where.ITEM_TYPE_ID = ITEM_TYPE_ID
    }

    if (ITEM_CATEGORY_ID) {
      where.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID
    }

    const { query, replacements } = QueryGetServiceAttributesParam({
      ITEM_GROUP_ID,
      ITEM_TYPE_ID,
      ITEM_CATEGORY_ID
    });

    const serviceAttributes = await db.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });

    res.status(200).json({
      status: true,
      message: "Success Get All Service Attribute",
      data: serviceAttributes
    });
  } catch (err) {
    res.status(404).json({
      message: "Action Problem With Get Service Attributes Data",
      data: err.message,
    });
  }
};


export const createServiceAttributes = async (req, res) => {
  try {
    const serviceAttributesData = req.body;

    const customId = await generateCustomId();
    serviceAttributesData.SERVICE_ATTRIBUTE_ID = customId;

    await chechMasterExist(serviceAttributesData);

    await serviceAttributes.create(serviceAttributesData);
    res.json({
      message: "Service Attributes Added Successfully",
    });
  } catch (err) {
    res.status(404).json({
      message: "Action Problem With Get Service Attributes Data",
      data: err.message,
    });
  }
};

export const editServiceAttributes = async (req, res) => {
  const { SERVICE_ATTRIBUTE_ID, ...dataServiceAttributes } = req.body;

  try {
    const serviceAttribute = await serviceAttributes.findByPk(
      SERVICE_ATTRIBUTE_ID
    );

    if (!serviceAttribute) {
      return res.status(404).json({ message: "Service attribute not found" });
    }

    await chechMasterExist(dataServiceAttributes);

    await serviceAttribute.update(dataServiceAttributes);

    res.json({ message: "Service Attributes Updated Successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update service attributes",
      error: err.message,
    });
  }
};

export const deleteServiceAttributes = async (req, res) => {
  const { SERVICE_ATTRIBUTE_ID } = req.body;

  try {
    const serviceAttributeData = await serviceAttributes.findByPk(
      SERVICE_ATTRIBUTE_ID
    );

    if (!serviceAttributeData) {
      return res.status(404).json({ message: "Service attributes not found" });
    }

    await serviceAttributeData.destroy();

    res.json({ message: "Service Attributes deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete service attributes",
      error: err.message,
    });
  }
};

export const getServiceAttributesDropdown = async (req, res) => {
  try {
    const serviceAttributes = await db.query(
      QueryGetServiceAttributesDropdown,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(serviceAttributes);
  } catch (err) {
    res.status(404).json({
      message: "Action Problem With Get Service Attributes Data",
      data: err.message,
    });
  }
};

const generateCustomId = async () => {
  const lastRecord = await serviceAttributes.findOne({
    order: [["SERVICE_ATTRIBUTE_ID", "DESC"]],
  });

  let nextId = "ISM0000001"; // default

  if (lastRecord) {
    const lastId = lastRecord.SERVICE_ATTRIBUTE_ID;
    const numericPart = parseInt(lastId.slice(3));
    const newNumber = numericPart + 1;
    const padded = newNumber.toString().padStart(7, "0");
    nextId = `ISM${padded}`;
  }

  return nextId;
};

const chechMasterExist = async (data) => {
  const dropdowns = {
    MasterItemCategories: "SERVICE_ITEM_CATEGORY_ID",
    MasterItemGroup: "SERVICE_ITEM_GROUP_ID",
    MasterItemTypes: "SERVICE_ITEM_TYPE_ID",
    MasterServiceCategories: "SERVICE_ATTRIBUTE_CATEGORY_ID",
    MasterServiceGroups: "SERVICE_ATTRIBUTE_GROUP_ID",
    MasterServiceTypes: "SERVICE_ATTRIBUTE_TYPE_ID",
  };

  const models = {
    MasterItemCategories,
    MasterItemTypes,
    MasterItemGroup,
    MasterServiceCategories,
    MasterServiceTypes,
    MasterServiceGroups,
  };

  for (const [modelKey, fieldKey] of Object.entries(dropdowns)) {
    const model = models[modelKey];    

    const serviceAttribute = await model.findByPk(data[fieldKey]);
    
    if (!serviceAttribute) {
      throw new Error(`${modelKey} not found`);
    }
  }
};
