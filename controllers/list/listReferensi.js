import db from "../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { ListCountry } from "../../models/list/referensiList.mod.js";
import { PackingPlanDetail } from "../../models/production/packing.mod.js";
import { ItemListStyle, qryGetItemCode, qryListstyleWithUser } from "../../models/list/itemStyle.mod.js";

export const getListCountry = async (req, res) => {
  try {
    const { buyer } = req.params;
    const BUYER_CODE = decodeURIComponent(buyer).toString();

    const listCountry = await ListCountry.findAll({
      where: {
        BUYER_CODE: BUYER_CODE,
      },
      raw: true,
    });

    return res.status(200).json({ data: listCountry });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data country",
      data: error,
    });
  }
};

export const postListCountry = async (req, res) => {
  try {
    const dataPost = req.body;
    const { update } = req.query;
    const { COUNTRY_ID } = dataPost;

    const postBox = update
      ? await ListCountry.update(dataPost, {
          where: { COUNTRY_ID: COUNTRY_ID },
        })
      : await ListCountry.create(dataPost);

    if (postBox) {
      const listCountry = await ListCountry.findAll({
        where: {
          BUYER_CODE: dataPost.BUYER_CODE,
        },
        raw: true,
      });

      return res.status(200).json({
        message: `Success ${update ? "update" : "create"} list country`,
        data: listCountry,
      });
    } else {
      return res.status(500).json({ message: "Faild to add" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get post country",
      data: error,
    });
  }
};

export const deleteCountryList = async (req, res) => {
  try {
    const { COUNTRY_ID, BUYER_CODE } = req.params;

    if (!COUNTRY_ID) return res.status(202).json({ message: "No data Box Id" });

    const checkUsed = await PackingPlanDetail.findAll({
      where: { COUNTRY_ID: COUNTRY_ID },
    });

    if (checkUsed.length > 0) {
      return res.status(202).json({
        message: "The country is already in use, it cannot be deleted",
      });
    }

    const deleteCountry = await ListCountry.destroy({
      where: { COUNTRY_ID: COUNTRY_ID },
    });

    if (deleteCountry) {
      const buyerCode = decodeURIComponent(BUYER_CODE);
      const listCountry = await ListCountry.findAll({
        where: {
          BUYER_CODE: buyerCode,
        },
        raw: true,
      });

      return res.status(200).json({
        message: `Success deleted country`,
        data: listCountry,
      });
    } else {
      return res.status(500).json({ message: "Faild to deleted" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get deleted box",
      data: error,
    });
  }
};


export const getListItemStyle = async (req, res) => {
  try {
    const { buyer } = req.params;
    const BUYER_CODE = decodeURIComponent(buyer).toString();

    // const listStyle = await ItemListStyle.findAll({
    //   where: {
    //     CUSTOMER_NAME: BUYER_CODE,
    //   },
    //   raw: true,
    // });

    const listStyle = await db.query(qryListstyleWithUser, {
      replacements : { buyer },
      type: QueryTypes.SELECT,
    });


    return res.status(200).json({ data: listStyle });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data list item style",
      data: error,
    });
  }
};


export const postListItemStyle = async (req, res) => {
  try {
    const dataStyle = req.body;

    let whereCheck = {
        PRODUCT_ITEM_CODE : dataStyle.PRODUCT_ITEM_CODE
      }

    if(dataStyle.PRODUCT_ITEM_ID){
      whereCheck[PRODUCT_ITEM_ID] = dataStyle.PRODUCT_ITEM_ID
    }
    const checkData = await ItemListStyle.findOne({
      where : whereCheck
    })

    if(checkData){
    return  res.status(404).json({
          message: "Data Style Or Product Already exist",
          data: error,
        });
    }

    const createNewStyle = await ItemListStyle.create(dataStyle);

    if(createNewStyle){
      return res.status(200).json({ data: createNewStyle });
    }

  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data list item style",
      data: error,
    });
  }
};


export const getListItemCode = async (req, res) => {
  try {
    
    const listItemCode = await db.query(qryGetItemCode, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: listItemCode });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data list item code",
      data: error,
    });
  }
};
