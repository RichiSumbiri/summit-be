import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const serviceAttributeValues = db.define(
  "service_attribute_values",
  {
    SERVICE_ATTRIBUTE_VALUE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    SERVICE_ATTRIBUTE_VALUE_CODE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    SERVICE_ATTRIBUTE_VALUE_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SERVICE_ATTRIBUTE_ID: {
      type: DataTypes.INTEGER,
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
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
  }
);

export default serviceAttributeValues;

export const QueryGetServiceAttributeValues = `
SELECT a.SERVICE_ATTRIBUTE_VALUE_ID , b.SERVICE_ATTRIBUTE_ID, b.ATTRIBUTE_NAME, 
c.SERVICE_CATEGORY_DESCRIPTION, a.SERVICE_ATTRIBUTE_VALUE_CODE, 
a.SERVICE_ATTRIBUTE_VALUE_NAME, 
a.IS_ACTIVE, a.CREATED_AT, a.UPDATED_AT, d.USER_INISIAL CREATED_BY, e.USER_INISIAL UPDATED_BY
FROM service_attribute_values a
INNER JOIN service_attributes b ON a.SERVICE_ATTRIBUTE_ID = b.SERVICE_ATTRIBUTE_ID
INNER JOIN master_service_category c ON b.SERVICE_ATTRIBUTE_CATEGORY_ID = c.SERVICE_CATEGORY_ID 
INNER JOIN xref_user_web d ON a.CREATED_BY = d.USER_ID
INNER JOIN xref_user_web e ON a.UPDATED_BY = e.USER_ID
`;

export const QueryGetServiceAttributeValuesParam = (filters = {}) => {
    let baseQuery = `
SELECT a.SERVICE_ATTRIBUTE_VALUE_ID , b.SERVICE_ATTRIBUTE_ID, b.ATTRIBUTE_NAME, 
c.SERVICE_CATEGORY_DESCRIPTION, a.SERVICE_ATTRIBUTE_VALUE_CODE, 
a.SERVICE_ATTRIBUTE_VALUE_NAME, 
a.IS_ACTIVE, a.CREATED_AT, a.UPDATED_AT, d.USER_INISIAL CREATED_BY, e.USER_INISIAL UPDATED_BY
FROM service_attribute_values a
INNER JOIN service_attributes b ON a.SERVICE_ATTRIBUTE_ID = b.SERVICE_ATTRIBUTE_ID
INNER JOIN master_service_category c ON b.SERVICE_ATTRIBUTE_CATEGORY_ID = c.SERVICE_CATEGORY_ID 
INNER JOIN xref_user_web d ON a.CREATED_BY = d.USER_ID
INNER JOIN xref_user_web e ON a.UPDATED_BY = e.USER_ID
WHERE 1=1
`;

    const replacements = {};

    if (filters.SERVICE_ATTRIBUTE_ID) {
        baseQuery += ' AND b.SERVICE_ATTRIBUTE_ID = :SERVICE_ATTRIBUTE_ID';
        replacements.SERVICE_ATTRIBUTE_ID = filters.SERVICE_ATTRIBUTE_ID;
    }

    baseQuery += ' ORDER BY a.SERVICE_ATTRIBUTE_VALUE_ID DESC';

    return { query: baseQuery, replacements };
};
