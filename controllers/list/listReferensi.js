import db from "../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { ListCountry, qryRefIntCountry } from "../../models/list/referensiList.mod.js";
import { PackingPlanDetail } from "../../models/production/packing.mod.js";
import { ItemListStyle, qryGetItemCode, qryListstyleWithUser } from "../../models/list/itemStyle.mod.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { baseUrl } from "../util/Utility.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function pharsingImgStyle(arrstyle, req){

 const withImgArr = arrstyle.map(item =>{
        let listItem = {...item}

        if (item.FRONT_IMG) {
          const FRONT = `${baseUrl}/images/style/${item.FRONT_IMG}`;
          listItem = { ...listItem, FRONT };
        } 

        if(item.BACK_IMG){
          const BACK = `${baseUrl}/images/style/${item.BACK_IMG}`;
          listItem = { ...listItem, BACK };
        }
        
        return listItem
      })
  return withImgArr
}



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


//query  referensi country code
export const getRefInterCountry = async (req, res) => {
  try {
    const { query } = req.params;
    const qry = `%${query}%`;
    // const countryName = `%${query}%`;

    const reqCountry = await db.query(qryRefIntCountry, {
      replacements: { qry },
      type: QueryTypes.SELECT,
    });

    return res.json({ status: "success", data: reqCountry });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: "Erro when get list country",
    });
  }
};


//query  referensi country code
export const getRefInterCountrySpecific = async (req, res) => {
  try {
    const { query } = req.params;
    const qry = `${query}`;
    // const countryName = `%${query}%`;

    const reqCountry = await db.query(qryRefIntCountry, {
      replacements: { qry },
      type: QueryTypes.SELECT,
    });

    return res.json({ status: "success", data: reqCountry });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: "Erro when get list country",
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

    let listStyle = await db.query(qryListstyleWithUser, {
      replacements : { buyer : BUYER_CODE},
      type: QueryTypes.SELECT,
    });

    if(listStyle.length > 0){

      listStyle = pharsingImgStyle(listStyle, req)
    }

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
     let dataStyle = req.body;
     const FRONT_IMAGE =  req.files?.FRONT_IMAGE || null
     const BACK_IMAGE =  req.files?.BACK_IMAGE || null

    let whereCheck = {
        PRODUCT_ITEM_CODE : dataStyle.PRODUCT_ITEM_CODE
      }

    if(dataStyle.PRODUCT_ITEM_ID){
      whereCheck['PRODUCT_ITEM_ID'] = dataStyle.PRODUCT_ITEM_ID
    }
    const checkData = await ItemListStyle.findOne({
      where : whereCheck
    })

    if(checkData){
        return res.status(404).json({
          message: "Data Style Or Product Already exist",
        });
    }


    if(FRONT_IMAGE !== null && FRONT_IMAGE !== undefined){
          dataStyle.FRONT_IMG = generateUniqueFileName(FRONT_IMAGE.name)
      }
    if(BACK_IMAGE !== null && BACK_IMAGE !== undefined){
          dataStyle.BACK_IMG = generateUniqueFileName(BACK_IMAGE.name)
      }

    const createNewStyle = await ItemListStyle.create(dataStyle);

    if(createNewStyle){
      let msg = `success create new style`
        if(FRONT_IMAGE !== null && FRONT_IMAGE !== undefined){
          const filePathFront = path.join(__dirname, "../../assets/images/styles", dataStyle.FRONT_IMG);
          
          fs.writeFile(filePathFront, FRONT_IMAGE.data,  (err) => {
            if(err){
              msg = msg + ` but error upload front Img`
            }
           })
        }
        if(BACK_IMAGE !== null && BACK_IMAGE !== undefined){
          const filePathBack = path.join(__dirname, "../../assets/images/styles", dataStyle.BACK_IMG);
          fs.writeFile(filePathBack, BACK_IMAGE.data,  (err) => {
                 if(err){
                    msg = msg + ` but error upload back Img`
                  }
           })
        }
        
      return res.status(200).json({ message: msg , data: createNewStyle })
    }

  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error create new item style",
      data: error,
    });
  }
};


export const patchListItemStyle = async (req, res) => {
  try {
    const dataStyle = req.body;
    const FRONT_IMAGE =  req.files?.FRONT_IMAGE
    const BACK_IMAGE =  req.files?.BACK_IMAGE


    const checkStyle =  await ItemListStyle.findOne({
     where : {
        ID: dataStyle.ID
      },
      raw: true
    });

    if(!checkStyle.ID){
       return  res.status(404).json({
          message: "Data Style Not exist",
        });
    }


     if(FRONT_IMAGE){
        if((dataStyle.FRONT_IMG !== checkStyle.FRONT_IMG) || !checkStyle.FRONT_IMG){
          dataStyle.FRONT_IMG = generateUniqueFileName(FRONT_IMAGE.name)
          console.log('new front img', dataStyle.FRONT_IMG );
          
        }
      }
    if(BACK_IMAGE){
        if((dataStyle.BACK_IMG !== checkStyle.BACK_IMG) || !checkStyle.BACK_IMG){
          dataStyle.BACK_IMG = generateUniqueFileName(BACK_IMAGE.name)
        }
      }

    // console.log(dataStyle);
    const updateStyle = await ItemListStyle.update(dataStyle, {
     where : {
        ID: dataStyle.ID
      }
    });
    
    

    if(updateStyle){
      let msg = `success update style`
      
        if(FRONT_IMAGE){
          const filePathFront = path.join(__dirname, "../../assets/images/styles", dataStyle.FRONT_IMG);
          
          fs.writeFile(filePathFront, FRONT_IMAGE.data,  (err) => {
            if(err){
              msg = msg + ` but error upload front Img`
            }
           })
        }

        if(BACK_IMAGE){
          const filePathBack = path.join(__dirname, "../../assets/images/styles", dataStyle.BACK_IMG);
          fs.writeFile(filePathBack, BACK_IMAGE.data,  (err) => {
                 if(err){
                    msg = msg + ` but error upload back Img`
                  }
           })
        }

      return res.status(200).json({ message: msg, data: updateStyle });
    }

  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error update data list item style",
      data: error,
    });
  }
};

export const deleteImgStyle = async (req, res) => {
  try {
        const {id, imgPosition} = req.params

      const checkStyle =  await ItemListStyle.findOne({
        where : {
          ID: id
        },
        raw: true
      });

        if(imgPosition === 'FRONT'){
          
          const filePathFrontDel = path.join(__dirname, "../../assets/images/styles", checkStyle.FRONT_IMG);

           fs.unlink(filePathFrontDel, async (err) => {
            if (err && err.code !== "ENOENT") {
              console.error("Error deleting file:", err);
            }
          });

            const updateStyle = await ItemListStyle.update({FRONT_IMG : null}, {
                where : {
                  ID: id
                }
              });
              return res.status(200).json({ message: 'success delete image style' });
        }


        if(imgPosition === 'BACK'){
          const filePathBack = path.join(__dirname, "../../assets/images/styles", checkStyle.BACK_IMG);

           fs.unlink(filePathBack, async (err) => {
            if (err && err.code !== "ENOENT") {
              console.error("Error deleting back file:", err);
            }
          });
            const updateStyle = await ItemListStyle.update({BACK_IMG : null}, {
                where : {
                  ID: id
                }
              });
            return res.status(200).json({ message: 'success delete image style' });
        }


  } catch (error) {
        console.log(error);
        return res.status(404).json({
          message: "error update data list item style",
          data: error,
        });
  }
}

export const deleteListItemStyle = async (req, res) => {
  try {
    const {idStyle} = req.params
    const deleteStyle = await ItemListStyle.update({DELETE_STATUS : 1 },{
      where : {
        ID : idStyle
      }
    })

    if(deleteStyle){
      return res.status(200).json({ message: 'Success Delete Style' });
    }else{
      return res.status(500).json({ message: 'Error Delete Style' });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error delete data list item style",
      data: error,
    });
  }
}

const generateUniqueFileName = (originalName) => {
  const arrName = originalName.split('.')  
  const timestamp = Date.now(); // waktu sekarang dalam milidetik
  const random = Math.floor(Math.random() * 1e6); // angka random
  const ext = arrName[1]; // ambil ekstensi file, misalnya .jpg
  return `${timestamp}_${random}.${ext}`;
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


export const getImgStyle = async (req, res) => {
  try {
    const { idStyle } = req.params;
    
    const getBgHeeader = await MobileBgHeader.findAll( {
      where: {
        ID_PERUSAHAAN: idPerusahaan,
      },
      raw: true
    });

    if (getBgHeeader) {
  
      const listBg = getBgHeeader.map((item) => {
        if (item.BG_HEADER_FILE) {
          const bgUrl = `${baseUrl}/images/${item.BG_HEADER_FILE}`;
          return { ...item, bgUrl };
        } else {
          return item;
        }
      });

      res.status(200).json({
        success: true,
        message: "success get bg header by id perusahaan",
        data: listBg,
      });
    }
  } catch (err) {
    console.log(err);
    
    res.status(404).json({
      success: false,
      error: err,
      message: "error get background header by id perusahaan",
    });
  }
};

