import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { masterItemLabDipCode } from "../../models/procurement/masterItemLabDipCode.js";
import { materialItemLabDipCode } from "../../models/procurement/materialItemLabDipCode.js";
import generateCustomId from "../helpers/generateCustomId.js";
import { errorResponse, successResponse } from "../helpers/responseHelper.js";
import { getPagination, getRawPagination } from "../util/Query.js";

export const getMasterLabDipCode = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const masterLabDipCodeData = await masterItemLabDipCode.findAll({
      attributes: ["ID", "CODE", "NAME", "IS_ACTIVE"],
      ...getPagination(page, limit),
    });

    return successResponse(
      res,
      masterLabDipCodeData,
      "Master Lab Dip Codes fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch Master Lab Dip Codes data",
      500
    );
  }
};

export const createMasterLabDipCode = async (req, res) => {
  const t = await db.transaction();
  try {
    const { user_id, ...body } = req.body;

    const customId = await generateCustomId(masterItemLabDipCode, "ID", "LDP");

    body.CREATED_BY = user_id;
    body.UPDATED_BY = user_id;
    body.ID = customId;

    await masterItemLabDipCode.create(body, {
      transaction: t,
    });

    await t.commit();

    return successResponse(
      res,
      [],
      "Master Lab Dip Code created successfully",
      201
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to create Master Lab Dip Code data",
      400
    );
  }
};

export const showMasterLabDipCode = async (req, res) => {
  try {
    const { ID } = req.params;

    const masterLabDipCodeData = await masterItemLabDipCode.findByPk(ID, {
      attributes: ["ID", "CODE", "NAME", "IS_ACTIVE"],
    });

    if (!masterLabDipCodeData) {
      return errorResponse(res, null, "Master Lab Dip Code not found", 404);
    }

    return successResponse(
      res,
      masterLabDipCodeData,
      "Master Lab Dip Code fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch Master Lab Dip Code data",
      500
    );
  }
};

export const updateMasterLabDipCode = async (req, res) => {
  const t = await db.transaction();
  const { ID } = req.params;

  try {
    const { user_id, ...body } = req.body;

    body.UPDATED_BY = user_id;
    const data = await masterItemLabDipCode.findByPk(ID);

    if (!data) {
      return errorResponse(res, null, "Master Lab Dip Code not found", 404);
    }

    await data.update(body, { transaction: t });

    await t.commit();

    return successResponse(
      res,
      null,
      "Master Lab Dip Code updated successfully",
      200
    );
  } catch (err) {
    await t.rollback();
    return errorResponse(res, err, "Failed to update Master Lab Dip Code", 400);
  }
};

//MATERIAL
export const getMaterialLabDipCode = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const query = `
      SELECT 
        a.ID,
        j.ORDER_ID,
        j.ORDER_TYPE_CODE,
        j.ORDER_REFERENCE_PO_NO,
        j.ORDER_STYLE_DESCRIPTION,
        k.CTC_NAME CUSTOMER,
        k.CTC_CODE CUSTOMER_CODE,
        m.CTPROD_SESION_CODE SEASON,
        n.CTPROG_CODE PROGRAM,
        l.CTPROD_DIVISION_CODE DIVISION,
        b.BOM_STRUCTURE_ID BOM_ID,
        c.ITEM_ID,
        c.ITEM_DESCRIPTION,
        d.ITEM_TYPE_CODE,
        e.ITEM_CATEGORY_CODE,
        f.ID DIMENSION_ID,
        g.COLOR_DESCRIPTION,
        h.SIZE_DESCRIPTION,
        f.SERIAL_NO,
        q.ID MASTER_LAB_DIP_ID,
        q.CODE MASTER_LAB_DIP_CODE,
        o.CREATED_AT,
        p.USER_INISIAL CREATED_BY,
        COALESCE(o.STATUS_FLAG, 0) AS STATUS_FLAG,
        o.ID MATERIAL_LAB_DIP_CODE_ID
      FROM bom_structure_sourcing_detail a
      INNER JOIN bom_structure_list b ON a.BOM_STRUCTURE_LINE_ID = b.ID
      INNER JOIN master_item_id c ON b.MASTER_ITEM_ID = c.ITEM_ID
      INNER JOIN master_item_type d ON c.ITEM_TYPE_ID = d.ITEM_TYPE_ID
      INNER JOIN master_item_category e ON e.ITEM_CATEGORY_ID = c.ITEM_CATEGORY_ID
      INNER JOIN master_item_dimension f ON f.ID = a.ITEM_DIMENSION_ID
      INNER JOIN master_color_chart g ON g.COLOR_ID = f.COLOR_ID
      INNER JOIN master_size_chart h ON h.SIZE_ID = f.SIZE_ID
      INNER JOIN bom_structure i ON i.ID = b.BOM_STRUCTURE_ID
      INNER JOIN order_po_header j ON j.ORDER_ID = i.ORDER_ID
      INNER JOIN customer_detail k ON k.CTC_ID = j.CUSTOMER_ID
      INNER JOIN customer_product_division l ON l.CTPROD_DIVISION_ID = j.CUSTOMER_DIVISION_ID
      INNER JOIN customer_product_season m ON m.CTPROD_SESION_ID = j.CUSTOMER_SEASON_ID
      INNER JOIN customer_program_name n ON n.CTPROG_ID  = j.CUSTOMER_PROGRAM_ID
      LEFT  JOIN material_items_lab_dip_code o ON o.BOM_STRUCTURE_SOURCING_DETAIL_ID = a.ID  
      LEFT  JOIN xref_user_web p ON p.USER_ID = o.CREATED_BY  
      LEFT  JOIN master_lab_dip_code q ON q.ID = o.LAB_DIP_CODE_ID 
      WHERE e.ITEM_CATEGORY_LABDIPS_AVAILABILITY = 'Y' AND b.status = "Confirmed"
      ORDER BY j.ORDER_ID, c.ITEM_ID, f.ID ASC
      ${getRawPagination(page, limit)}
    `;

    const data = await db.query(query, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      data,
      "Material Item Lab Dip Code fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch Material Item Lab Dip Code data",
      500
    );
  }
};

export const getBOMLabDipCode = async (req, res) => {
  const { ORDER_ID } = req.params;

  try {
    const query = `
      SELECT 
        a.ID,
        j.ORDER_ID,
        CONCAT(j.ORDER_TYPE_CODE, '/', j.ORDER_REFERENCE_PO_NO, '/', j.ORDER_STYLE_DESCRIPTION) AS DESCRIPTION1,
        CONCAT(s.ITEM_ID, '/', s.ITEM_CODE , '/', s.ITEM_DESCRIPTION ) AS DESCRIPTION2,
        i.LAST_REV_ID,
        t.NOTE,
        k.CTC_NAME CUSTOMER,
        m.CTPROD_SESION_NAME SEASON,
        n.CTPROG_NAME PROGRAM,
        l.CTPROD_DIVISION_NAME DIVISION,
        b.BOM_STRUCTURE_ID BOM_ID,
        c.ITEM_ID,
        c.ITEM_DESCRIPTION,
        d.ITEM_TYPE_CODE,
        e.ITEM_CATEGORY_CODE,
        f.ID DIMENSION_ID,
        g.COLOR_DESCRIPTION,
        h.SIZE_DESCRIPTION,
        f.SERIAL_NO,
        q.ID MASTER_LAB_DIP_ID,
        q.CODE MASTER_LAB_DIP_CODE,
        o.CREATED_AT,
        p.USER_INISIAL CREATED_BY,
        COALESCE(o.STATUS_FLAG, 0) AS STATUS_FLAG,
        o.ID MATERIAL_LAB_DIP_CODE_ID
      FROM bom_structure_sourcing_detail a
      INNER JOIN bom_structure_list b ON a.BOM_STRUCTURE_LINE_ID = b.ID
      INNER JOIN master_item_id c ON b.MASTER_ITEM_ID = c.ITEM_ID
      INNER JOIN master_item_type d ON c.ITEM_TYPE_ID = d.ITEM_TYPE_ID
      INNER JOIN master_item_category e ON e.ITEM_CATEGORY_ID = c.ITEM_CATEGORY_ID
      INNER JOIN master_item_dimension f ON f.ID = a.ITEM_DIMENSION_ID
      INNER JOIN master_color_chart g ON g.COLOR_ID = f.COLOR_ID
      INNER JOIN master_size_chart h ON h.SIZE_ID = f.SIZE_ID
      INNER JOIN bom_structure i ON i.ID = b.BOM_STRUCTURE_ID
      INNER JOIN order_po_header j ON j.ORDER_ID = i.ORDER_ID
      INNER JOIN customer_detail k ON k.CTC_ID = j.CUSTOMER_ID
      INNER JOIN customer_product_division l ON l.CTPROD_DIVISION_ID = j.CUSTOMER_DIVISION_ID
      INNER JOIN customer_product_season m ON m.CTPROD_SESION_ID = j.CUSTOMER_SEASON_ID
      INNER JOIN customer_program_name n ON n.CTPROG_ID  = j.CUSTOMER_PROGRAM_ID
      LEFT  JOIN material_items_lab_dip_code o ON o.BOM_STRUCTURE_SOURCING_DETAIL_ID = a.ID  
      LEFT  JOIN xref_user_web p ON p.USER_ID = o.CREATED_BY  
      LEFT  JOIN master_lab_dip_code q ON q.ID = o.LAB_DIP_CODE_ID 
      INNER JOIN bom_template r ON r.ID = i.BOM_TEMPLATE_ID
      INNER JOIN master_item_id s ON s.ITEM_ID = r.MASTER_ITEM_ID
      LEFT  JOIN bom_structure_notes t ON i.ID = t.BOM_STRUCTURE_ID AND i.LAST_REV_ID = t.REV_ID
      WHERE e.ITEM_CATEGORY_LABDIPS_AVAILABILITY = 'Y' 
      AND b.status = "Confirmed" 
      AND j.ORDER_ID = :orderId
      ORDER BY j.ORDER_ID, c.ITEM_ID, f.ID ASC
    `;

    const data = await db.query(query, {
      replacements: { orderId: ORDER_ID },
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      data,
      "BOM Item Lab Dip Code fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch BOM Item Lab Dip Code data",
      500
    );
  }
};

export const updateMaterialLabDipCode = async (req, res) => {
  const t = await db.transaction();

  try {
    const { USER_ID, ID, ...body } = req.body;

    body.UPDATED_BY = USER_ID;

    if (ID) {
      const exists = await materialItemLabDipCode.findByPk(ID, {
        transaction: t,
      });

      if (!exists) {
        await t.rollback();
        return errorResponse(res, null, "Material Lab Dip Code not found", 404);
      }

      await exists.update(body, { transaction: t });

      await t.commit();
      return successResponse(
        res,
        null,
        "Material Lab Dip Code updated successfully",
        200
      );
    } else {
      // ✅ Create case
      body.CREATED_BY = USER_ID;
      await materialItemLabDipCode.create(body, { transaction: t });

      await t.commit();
      return successResponse(
        res,
        null,
        "Material Lab Dip Code created successfully",
        201
      );
    }
  } catch (err) {
    await t.rollback();
    return errorResponse(
      res,
      err,
      "Failed to update Material Lab Dip Code",
      400
    );
  }
};

export const getOrderDropdown = async (req, res) => {
  const { page, limit } = req.query;

  try {
    const query = `
      SELECT 
        a.ORDER_ID,
        a.ORDER_STATUS,
        a.ITEM_ID,
        b.ITEM_DESCRIPTION,
        e.ITEM_CATEGORY_CODE,
        a.ORDER_REFERENCE_PO_NO,
        a.ORDER_STYLE_DESCRIPTION,
        a.ORDER_TYPE_CODE,
        c.ID BOM_ID,
        c.LAST_REV_ID,
        d.NOTE,
        b.ITEM_CODE,
        a.CUSTOMER_ID,
        f.CTC_CODE CUSTOMER_CODE,
        f.CTC_NAME CUSTOMER_NAME,
        a.CUSTOMER_DIVISION_ID,
        g.CTPROD_DIVISION_NAME CUSTOMER_DIVISION_NAME,
        a.CUSTOMER_SEASON_ID,
        h.CTPROD_SESION_NAME CUSTOMER_SEASON_NAME,
        a.CUSTOMER_PROGRAM_ID,
        i.CTPROG_NAME CUSTOMER_PROGRAM_NAME,
        a.ORDER_CONFIRMED_DATE,
        a.ORDER_UOM,
        a.CURRENCY_CODE,
        a.CONTRACT_NO,
        a.CONTRACT_CONFIRMED_DATE,
        a.CONTRACT_EXPIRED_DATE,
        a.PROJECTION_ORDER_ID,
        a.FLAG_MULTISET_ITEMS,
        a.NOTE_REMARKS,
        j.USER_INISIAL CREATED_BY,
        a.CREATE_DATE,
        k.USER_INISIAL UPDATED_BY,
        a.UPDATE_DATE,
        a.SIZE_TEMPLATE_ID
      FROM order_po_header a
      INNER JOIN master_item_id b ON a.ITEM_ID  = b.ITEM_ID 
      INNER JOIN bom_structure c ON a.ORDER_ID = c.ORDER_ID
      LEFT  JOIN bom_structure_notes d ON c.ID = d.BOM_STRUCTURE_ID AND d.REV_ID = c.LAST_REV_ID
      INNER JOIN master_item_category e ON e.ITEM_CATEGORY_ID = b.ITEM_CATEGORY_ID
      INNER JOIN customer_detail f ON f.CTC_ID = a.CUSTOMER_ID
      INNER JOIN customer_product_division g ON g.CTPROD_DIVISION_ID = a.CUSTOMER_DIVISION_ID
      INNER JOIN customer_product_season h ON h.CTPROD_SESION_ID = a.CUSTOMER_SEASON_ID
      INNER JOIN customer_program_name i ON i.CTPROG_ID = a.CUSTOMER_PROGRAM_ID
      INNER JOIN xref_user_web j ON j.USER_ID = a.CREATE_BY
      LEFT  JOIN xref_user_web k ON k.USER_ID = a.UPDATE_BY
      WHERE EXISTS (
        SELECT 1 
        FROM bom_structure_list l 
        INNER JOIN bom_structure_sourcing_detail m ON m.BOM_STRUCTURE_LINE_ID = l.ID
        INNER JOIN master_item_id n ON n.ITEM_ID = l.MASTER_ITEM_ID
        INNER JOIN master_item_category o ON o.ITEM_CATEGORY_ID = n.ITEM_CATEGORY_ID
        WHERE l.BOM_STRUCTURE_ID = c.ID 
        AND o.ITEM_CATEGORY_LABDIPS_AVAILABILITY = "Y"
        AND l.STATUS = "Confirmed"
      )
      ORDER BY a.ORDER_ID
      ${getRawPagination(page, limit)}
    `;

    const data = await db.query(query, {
      type: QueryTypes.SELECT,
    });

    return successResponse(
      res,
      data,
      "Order Dropdown fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch Order Dropdown data",
      500
    );
  }
};