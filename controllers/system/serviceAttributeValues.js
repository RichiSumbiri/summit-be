import db from "../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import serviceAttributeValues, {
  QueryGetServiceAttributeValues, QueryGetServiceAttributeValuesParam,
} from "../../models/system/serviceAttributeValues.mod.js";
import serviceAttributes from "../../models/system/serviceAttributes.mod.js";

export const getServiceAttributeValues = async (req, res) => {
  try {
    const serviceAttributeValues = await db.query(
      QueryGetServiceAttributeValues,{
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json(serviceAttributeValues);
  } catch (err) {
    res.status(404).json({
      message: "Action Problem With Get Service Attributes Data",
      data: err.message,
    });
  }
};

export const getServiceAttributeValuesParam = async (req, res) => {
  const { SERVICE_ATTRIBUTE_ID } = req.query;

  try {
    const { query, replacements } = QueryGetServiceAttributeValuesParam({
      SERVICE_ATTRIBUTE_ID
    });

    const serviceAttributeValues = await db.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });

    res.status(200).json(serviceAttributeValues);
  } catch (err) {
    res.status(404).json({
      message: "Action Problem With Get Service Attribute Values Data",
      data: err.message,
    });
  }
};

export const createServiceAttributeValues = async (req, res) => {
  try {
    const serviceAttributeValuesData = req.body;

    const customId = await generateCustomId();
    serviceAttributeValuesData.SERVICE_ATTRIBUTE_VALUE_ID = customId;

    const serviceAttribute = await serviceAttributes.findByPk(
      serviceAttributeValuesData.SERVICE_ATTRIBUTE_ID
    );

    if (!serviceAttribute) {
      return res.status(404).json({ message: "Service attribute not found" });
    }

    await serviceAttributeValues.create(serviceAttributeValuesData);
    res.json({
      message: "Service Attributes Added Successfully",
    });
  } catch (err) {
    res.status(404).json({
      message: "Action Problem With Get Service Attributes Data",
      data: err.errors || err,
    });
  }
};

export const editServiceAttributeValues = async (req, res) => {
  const { SERVICE_ATTRIBUTE_VALUE_ID, ...dataServiceAttributes } = req.body;

  try {
    const serviceAttributeValue = await serviceAttributeValues.findByPk(
      SERVICE_ATTRIBUTE_VALUE_ID
    );

    if (!serviceAttributeValue) {
      return res.status(404).json({ message: "Service attribute value not found" });
    }

    const serviceAttribute = await serviceAttributes.findByPk(
      dataServiceAttributes.SERVICE_ATTRIBUTE_ID
    );

    if (!serviceAttribute) {
      return res.status(404).json({ message: "Service attribute not found" });
    }

    await serviceAttributeValue.update(dataServiceAttributes);

    res.json({ message: "Service Attributes Updated Successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update service attributes",
      error: err.message,
    });
  }
};

export const deleteServiceAttributeValues = async (req, res) => {
  const { SERVICE_ATTRIBUTE_VALUE_ID } = req.body;

  try {
    const serviceAttributeData = await serviceAttributeValues.findByPk(
      SERVICE_ATTRIBUTE_VALUE_ID
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

const generateCustomId = async () => {
  const lastRecord = await serviceAttributeValues.findOne({
    order: [["SERVICE_ATTRIBUTE_VALUE_ID", "DESC"]],
  });

  let nextId = "ISV0000001"; // default

  if (lastRecord) {
    const lastId = lastRecord.SERVICE_ATTRIBUTE_VALUE_ID;
    const numericPart = parseInt(lastId.slice(3));
    const newNumber = numericPart + 1;
    const padded = newNumber.toString().padStart(7, "0");
    nextId = `ISV${padded}`;
  }

  return nextId;
};
