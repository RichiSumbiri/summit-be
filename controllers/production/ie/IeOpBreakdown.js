import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { qryGetStyleByTree, qryGetThreeStyle } from "../../../models/ie/IeOb.mod.js";
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
      message: "Gagal memproses data",
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
            message: "Gagal memproses data",
            error: error.message,
            });
    }
}