import moment from "moment";
import { QueryTypes } from "sequelize";

import db from "../../config/database.js";
import {
  UserAcc,
  MenuAccessRole,
  QueryMenuView,
} from "../../models/setup/userAcces.mod.js";

// import { QueryTypes } from 'Sequelize'; //model user

//menuRole
export const getUserAcces = async (req, res) => {
  try {
    const userAcces = await db.query(MenuAccessRole, {
      replacements: { id: req.params.id },
      type: QueryTypes.SELECT,
    });
    res.json(userAcces);
  } catch (error) {
    res.json({ message: error.message });
  }
};

//Update User Access
export const postAccessUser = async (req, res) => {
  try {
    const arrObjMenuAcc = req.body

    if(arrObjMenuAcc.length === 0) return res.status(404).json({message: 'Data Access Required'})
    
    
    const destAllMenu = await UserAcc.destroy({
      where: {
        USER_ID: arrObjMenuAcc[0].USER_ID,
      },
    });


    const postData = await UserAcc.bulkCreate(arrObjMenuAcc);

    if(postData){
      return res.json({
        message: "User Access Update",
      });
    }else{
      res.status(404).json({message : 'Failed Update Access User'})
    }
  } catch (error) {
    console.log(error);
    
    res.json({ message: error.message });
  }
};

// export const updateOrCreateUserAccess = async (req, res) => {
//   try {
//     const foundItem = await UserAcc.findOne({
//       where: {
//         USER_ID: req.params.id,
//         MENU_ID: req.params.menuid,
//       },
//       order: [["MENU_ID"]],
//     });

//     const dataAxs = req.body;

//     if (!foundItem) {
//       const item = await UserAcc.create(dataAxs);
//       return res.json({
//         item: item,
//         message: "User Access Added",
//       });
//     }

//     const item = await UserAcc.update(dataAxs, {
//       where: {
//         USER_ID: req.params.id,
//         MENU_ID: req.params.menuid,
//       },
//     });

//     return res.json({
//       item: item,
//       message: "User Access Update",
//     });
//   } catch (error) {
//     res.json({ message: error.message });
//   }
// };

//
//menu Access View


export const getViewAccess = async (req, res) => {
  try {
    const menuViewAccess = await db.query(QueryMenuView, {
      replacements: { userid: req.params.id },
      type: QueryTypes.SELECT,
    });
    if (menuViewAccess.length === 0)
      return res.status(400).json({ message: "Anda Belum Mendapatkan Aksess" });
    res.json(menuViewAccess);
  } catch (error) {
    res.json({ message: error.message });
  }
};
