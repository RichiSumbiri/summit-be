import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const serviceAttributes = db.define(
  "service_attributes",
  {
    SERVICE_ATTRIBUTE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    ATTRIBUTE_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SERVICE_ATTRIBUTE_GROUP_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SERVICE_ATTRIBUTE_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SERVICE_ATTRIBUTE_CATEGORY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SERVICE_ITEM_GROUP_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SERVICE_ITEM_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SERVICE_ITEM_CATEGORY_ID: {
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

export default serviceAttributes;

export const QueryGetServiceAttributesParam = (filters = {}) => {
    let query = `
SELECT 
a.SERVICE_ATTRIBUTE_ID, a.ATTRIBUTE_NAME, 
b.ITEM_CATEGORY_ID, b.ITEM_CATEGORY_CODE, b.ITEM_CATEGORY_DESCRIPTION,
c.ITEM_GROUP_ID, c.ITEM_GROUP_CODE, c.ITEM_GROUP_DESCRIPTION,
d.ITEM_TYPE_ID, d.ITEM_TYPE_CODE, d.ITEM_TYPE_DESCRIPTION,
e.SERVICE_CATEGORY_ID, e.SERVICE_CATEGORY_CODE, e.SERVICE_CATEGORY_DESCRIPTION,
f.SERVICE_GROUP_ID, f.SERVICE_GROUP_CODE, f.SERVICE_GROUP_DESCRIPTION,
g.SERVICE_TYPE_ID, g.SERVICE_TYPE_CODE, g.SERVICE_TYPE_DESCRIPTION,
a.IS_ACTIVE,
h.USER_INISIAL CREATED_BY, i.USER_INISIAL UPDATED_BY, a.CREATED_AT, a.UPDATED_AT
FROM service_attributes a
INNER JOIN master_item_category b ON a.SERVICE_ITEM_CATEGORY_ID = b.ITEM_CATEGORY_ID
INNER JOIN master_item_group c ON a.SERVICE_ITEM_GROUP_ID = c.ITEM_GROUP_ID
INNER JOIN master_item_type d ON a.SERVICE_ITEM_TYPE_ID = d.ITEM_TYPE_ID
INNER JOIN master_service_category e ON a.SERVICE_ATTRIBUTE_CATEGORY_ID  = e.SERVICE_CATEGORY_ID 
INNER JOIN master_service_group f ON a.SERVICE_ATTRIBUTE_GROUP_ID = f.SERVICE_GROUP_ID
INNER JOIN master_service_type g ON a.SERVICE_ATTRIBUTE_TYPE_ID = g.SERVICE_TYPE_ID
INNER JOIN xref_user_web h ON a.CREATED_BY = h.USER_ID
INNER JOIN xref_user_web i ON a.UPDATED_BY = i.USER_ID
WHERE 1=1
`;

    const replacements = {};

    if (filters.ITEM_GROUP_ID) {
        query += ' AND c.ITEM_GROUP_ID = :ITEM_GROUP_ID';
        replacements.ITEM_GROUP_ID = filters.ITEM_GROUP_ID;
    }

    if (filters.ITEM_TYPE_ID) {
        query += ' AND d.ITEM_TYPE_ID = :ITEM_TYPE_ID';
        replacements.ITEM_TYPE_ID = filters.ITEM_TYPE_ID;
    }

    if (filters.ITEM_CATEGORY_ID) {
        query += ' AND b.ITEM_CATEGORY_ID = :ITEM_CATEGORY_ID';
        replacements.ITEM_CATEGORY_ID = filters.ITEM_CATEGORY_ID;
    }

    query += ' ORDER BY a.SERVICE_ATTRIBUTE_ID DESC';

    return { query, replacements };
};

export const QueryGetServiceAttributes = `
SELECT 
a.SERVICE_ATTRIBUTE_ID, a.ATTRIBUTE_NAME, 
b.ITEM_CATEGORY_ID, b.ITEM_CATEGORY_CODE, b.ITEM_CATEGORY_DESCRIPTION,
c.ITEM_GROUP_ID, c.ITEM_GROUP_CODE, c.ITEM_GROUP_DESCRIPTION,
d.ITEM_TYPE_ID, d.ITEM_TYPE_CODE, d.ITEM_TYPE_DESCRIPTION,
e.SERVICE_CATEGORY_ID, e.SERVICE_CATEGORY_CODE, e.SERVICE_CATEGORY_DESCRIPTION,
f.SERVICE_GROUP_ID, f.SERVICE_GROUP_CODE, f.SERVICE_GROUP_DESCRIPTION,
g.SERVICE_TYPE_ID, g.SERVICE_TYPE_CODE, g.SERVICE_TYPE_DESCRIPTION,
a.IS_ACTIVE,
h.USER_INISIAL CREATED_BY, i.USER_INISIAL UPDATED_BY, a.CREATED_AT, a.UPDATED_AT
FROM service_attributes a
INNER JOIN master_item_category b ON a.SERVICE_ITEM_CATEGORY_ID = b.ITEM_CATEGORY_ID
INNER JOIN master_item_group c ON a.SERVICE_ITEM_GROUP_ID = c.ITEM_GROUP_ID
INNER JOIN master_item_type d ON a.SERVICE_ITEM_TYPE_ID = d.ITEM_TYPE_ID
INNER JOIN master_service_category e ON a.SERVICE_ATTRIBUTE_CATEGORY_ID  = e.SERVICE_CATEGORY_ID 
INNER JOIN master_service_group f ON a.SERVICE_ATTRIBUTE_GROUP_ID = f.SERVICE_GROUP_ID
INNER JOIN master_service_type g ON a.SERVICE_ATTRIBUTE_TYPE_ID = g.SERVICE_TYPE_ID
INNER JOIN xref_user_web h ON a.CREATED_BY = h.USER_ID
INNER JOIN xref_user_web i ON a.UPDATED_BY = i.USER_ID
ORDER BY a.SERVICE_ATTRIBUTE_ID DESC
`;
export const QueryGetServiceAttributesDropdown = `
SELECT 
  a.SERVICE_ATTRIBUTE_ID, 
  a.ATTRIBUTE_NAME, 
  CONCAT(
    c.SERVICE_GROUP_DESCRIPTION, '/', 
    d.SERVICE_TYPE_DESCRIPTION, '/',
    b.SERVICE_CATEGORY_DESCRIPTION
  ) AS SERVICE
FROM service_attributes a
INNER JOIN master_service_category b ON a.SERVICE_ATTRIBUTE_CATEGORY_ID = b.SERVICE_CATEGORY_ID
INNER JOIN master_service_group c ON a.SERVICE_ATTRIBUTE_GROUP_ID = c.SERVICE_GROUP_ID
INNER JOIN master_service_type d ON a.SERVICE_ATTRIBUTE_TYPE_ID = d.SERVICE_TYPE_ID
`;