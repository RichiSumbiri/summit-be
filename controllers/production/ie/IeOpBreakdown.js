import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { getLasIdOb, getListOb, IeObHeader, IeObSize, qryGetStyleByTree, qryGetThreeStyle, qryListSizesOb } from "../../../models/ie/IeOb.mod.js";
import { getUniqueAttribute } from "../../util/Utility.js";
import { pharsingImgStyle } from "../../list/listReferensi.js";


export const getDataTreeStyleOb = async (req, res) => {
  try {
    const styleThree = await db.query(qryGetThreeStyle, {
      type: QueryTypes.SELECT,
    });

    let buyerIndex = 1;

    const treeData = {
      name: '',
      children: [
        {
          name: 'PT SUMBIRI',
          id: '0',
          children: [],
        }
      ]
    };

    const buyerList = getUniqueAttribute(styleThree, 'CUSTOMER_NAME');

    for (const buyerName of buyerList) {
      const byrPadId = String(buyerIndex).padStart(2, '0');
      const buyerId = `B${byrPadId}`;
      const buyerNode = {
        name: buyerName,
        id: buyerId,
        level: 'Buyer',
        children: [],
      };

      const typeList = getUniqueAttribute(
        styleThree.filter(item => item.CUSTOMER_NAME === buyerName),
        'PRODUCT_TYPE'
      );

      let typeIndex = 1;

      for (const type of typeList) {
        const padType = String(typeIndex + 1).padStart(2, '0');
        const typeId = `${buyerId}T${padType}`;
        const typeNode = {
          name: type,
          id: typeId,
          level: 'Product Type',
          children: [],
        };

        const filteredCategories = styleThree.filter(
          item => item.CUSTOMER_NAME === buyerName && item.PRODUCT_TYPE === type
        );

        let categoryIndex = 1;

        for (const cat of filteredCategories) {
          const padCategoryId = String(categoryIndex + 1).padStart(2, '0');
          const categoryId = `${typeId}C${padCategoryId}`;
          const categoryNode = {
            name: cat.PRODUCT_CATEGORY,
            id: categoryId,
            level: 'Category',
            ttl_product: cat.TTL_PRODUCT,
          };

          typeNode.children.push(categoryNode);
          categoryIndex++;
        }

        buyerNode.children.push(typeNode);
        typeIndex++;
      }

      treeData.children[0].children.push(buyerNode);
      buyerIndex++;
    }

    return res.status(200).json({
      success: true,
      message: "Tree data berhasil dibuat",
      data: treeData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
    });
  }
};


export const getListStyleByOb= async (req,res) => {
    try {
        const {buyer} = req.params
        const {prodType, prodCat} = req.query
        
        const query = qryGetStyleByTree(buyer, prodType, prodCat)

        let listStyle = await db.query(query, {
                type: QueryTypes.SELECT,
            });

        if(listStyle.length>0){
            listStyle = pharsingImgStyle(listStyle, req)
        }

        return res.status(200).json({data: listStyle})
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            message: "Filed get data",
            error: error.message,
            });
    }
}

export const getSizesOb = async (req, res) =>{
  try {
    const {prodType} = req.params

    const listSizes = await db.query(qryListSizesOb, {
      replacements: {prodType},
      type: QueryTypes.SELECT,
    })
    return res.status(200).json({data: listSizes})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}

export const postIeOb = async (req, res) =>{
  try {
    let {dataNewOb, dataSize} = req.body

    //ambil ob id
    const getLastId = await db.query(getLasIdOb, {
      replacements: {prodItemId : dataNewOb.PRODUCT_ITEM_ID},
      type: QueryTypes.SELECT,
    })

    //jika belum ada ob id sebelumnya maka masukan initial id 0001
    const lastId = getLastId[0]? getLastId[0].LATST_ID.toString().padStart(3, "0") : '001'

    //masukan ob id ke object ob header
    const OB_ID = dataNewOb.OB_CODE+lastId
    dataNewOb.OB_ID = OB_ID

    //masukan ob id ke array of obj sizes
    const sizeOb = dataSize.map(sz => ({...sz, OB_ID}))
    
    const createNewOb = await IeObHeader.create(dataNewOb)

    if(createNewOb){
      const createNewObSize = await IeObSize.bulkCreate(sizeOb)
    }

    return res.status(200).json({message:'Success Create New OB'})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}


export const getlistObApi = async (req, res) =>{
  try {
    const {prodItemId} = req.params

    const listIeOb = await db.query(getListOb, {
      replacements: {prodItemId},
      type: QueryTypes.SELECT,
    })
    
    return res.status(200).json({data: listIeOb})
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Filed get data",
      error: error.message,
      });
  }
}