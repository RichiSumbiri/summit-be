import Users from "../../models/setup/users.mod.js";
import bcryptjs from "bcryptjs";
import moment from "moment/moment.js";
import { AllMenus, qryGetAllRole, qryGetDeptAll, qryUserRole, UserAcc, UserRole, XrefRoleAccess } from "../../models/setup/userAcces.mod.js";
import db from "../../config/database.js";
import { QueryTypes } from "sequelize";

//controller Get ALL User
export const getUsers = async (req, res) => {
  const users = await Users.findAll();
  res.json(users);
};

//controller Get User by ID
export const getUserById = async (req, res) => {
  const user = await Users.findAll({
    where: {
      USER_ID: req.params.id,
    },
  });
  res.json(user[0]);
};

//controller Create User
export const createUser = async (req, res) => {
 try {
   const dataUser = req.body;
  const cekUsername = await Users.findAll({
    attributes: ["USER_NAME"],
    where: {
      USER_NAME: dataUser.USER_NAME,
    },
  });
  // res.json(cekUsername);
  if (cekUsername.length !== 0)
    return res.status(400).json({ message: "Username sudah ada" });
  const hashPassword = await bcryptjs.hash(dataUser.USER_PASS, 10);
  dataUser.USER_PASS = hashPassword;
 const createDuser =  await Users.create(dataUser);
  const getIdUser = createDuser.get({ plain: true });

  if(getIdUser.USER_ID && dataUser.ROLE_ID){
      const findAccessRole = await XrefRoleAccess.findAll({
      where : {
        ROLE_ID : dataUser.ROLE_ID
      },
      raw : true
    })

    if(findAccessRole.length > 0){
      const newAccsUser = findAccessRole.map(item => ({...item, USER_ID: getIdUser.USER_ID}))

      const newUserRoleAcc = await UserAcc.bulkCreate(newAccsUser)
    }
  }

 return res.json({
    // datanew: resData,
    message: "User Added",
  });
 } catch (error) {
  console.log(error)
  res.json({
      message: error.message,
    });
 }
};

//controller Update User
export const updateUser = async (req, res) => {
  const dataUser = req.body;
  const hashPassword = await bcryptjs.hash(dataUser.USER_PASS, 10);
  dataUser.USER_PASS = hashPassword;
  await Users.update(dataUser, {
    where: {
      USER_ID: req.params.id,
    },
  });
  res.json({
    message: "User Updated",
  });
};

//controller Delete User
export const deleteUser = async (req, res) => {
  await Users.update(req.body, {
    where: {
      USER_ID: req.params.id,
    },
  });
  res.json({
    message: "User Delete",
  });
};

//controller Update Mode User
export const updateUserMode = async (req, res) => {
  try {
    const dataUser = req.body;
    await Users.update(dataUser, {
      where: {
        USER_ID: req.params.id,
      },
    });
    res.json({
      message: "User Updated",
    });
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
};



//controller All Dept role
export const getAllDept = async (req, res) => {
  try {  
    const getDept = await db.query(qryGetDeptAll,{ type: QueryTypes.SELECT });

    return  res.json({ data: getDept });

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to get dept role`,
    });
  }
};



export const getAllRole = async (req, res) => {
  try {  

    const facthRole = await db.query(qryGetAllRole,{type: QueryTypes.SELECT });

    return  res.json({ data: facthRole });

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to get data role`,
    });
  }
};


export const createRole = async (req, res) => {
  try {
    const dataRole = req.body;
  
    const checkRole = await UserRole.findAll({
      attributes: ["ROLE_NAME"],
      where: {
        ROLE_NAME: dataRole.ROLE_NAME,
        ROLE_UNIT: dataRole.ROLE_UNIT,
      },
      raw: true
    });
  
    // res.json(cekUsername);
    if (checkRole.length !== 0)  return res.status(400).json({ message: "Already Role Name " });
  
  
  
    await UserRole.create(dataRole);
    return  res.json({  message: "User Role Created" });

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to created role: ${error.message}`,
    });
  }
};


export const updateRole = async (req, res) => {
  try {
    const dataRole = req.body;
    
    // res.json(cekUsername);
    if (!dataRole.ROLE_ID)  return res.status(400).json({ message: "Role ID Required" });

    await UserRole.update(dataRole, {
      where : {
        ROLE_ID : dataRole.ROLE_ID
      }
    });
    return  res.json({  message: "User Role Updated" });

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to created role: ${error.message}`,
    });
  }
};



//get all menu untuk modal menu auth
export const getAllMenus = async (req, res) => {
  try {  
    const {roleId} = req.params
    const menus = await db.query(AllMenus,{
      replacements : {roleId},
      type: QueryTypes.SELECT 
    });

    return  res.json({ data: menus });

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to get data menus`,
    });
  }
};



export const postRoleAccess = async (req, res) => {
  try {
    const dataPost = req.body
    
    if(!dataPost[0].ROLE_ID) return res.status(404).json({message : 'Required Role ID'})

    const ROLE_ID = dataPost[0].ROLE_ID
    const deleteAcessBefore = await XrefRoleAccess.destroy({
      where : {
         ROLE_ID : ROLE_ID
      }
    })

    const blukNewAccess = await XrefRoleAccess.bulkCreate(dataPost)


    const userRole = await Users.findAll({
      attributes : ['USER_ID'],
      where : {
        ROLE_ID : ROLE_ID
      },
      raw: true
    })

    if(userRole.length > 0){
      const deleteAccsUserRole = await UserAcc.destroy({
        where : { 
          USER_ID : userRole.map(itm => itm.USER_ID)
        }
      })

      let dataWithUserId = []
      for (const usr of userRole) {

        const newAccsUser = dataPost.map(item => ({...item, USER_ID: usr.USER_ID}))
        dataWithUserId.push(...newAccsUser)
      }

      const newUserRoleAcc = await UserAcc.bulkCreate(dataWithUserId)
    }
   
    if(blukNewAccess){
     return res.json({message : 'success submit access'})
    }

  } catch (error) {
     console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to get data menus`,
    });
  }
}


//get all menu untuk modal menu auth
export const getListUserRole = async (req, res) => {
  try {  
    const {roleId} = req.params
    const stringRole = `xuw.ROLE_ID = '${roleId}' `
    const qryUser = qryUserRole(stringRole)

    
    const usersList = await db.query(qryUser, {
    type:   QueryTypes.SELECT
    })

    return  res.json({ data: usersList });

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to get data user`,
    });
  }
};

//reff role user
export const getUserForRole = async (req, res) => {
  try {  
    const {qry} = req.params
     const stringQry = `xuw.USER_NAME LIKE '%${qry}%' OR xuw.USER_INISIAL LIKE '%${qry}%'`
    const qryUser = qryUserRole(stringQry)

    const usersList = await db.query(qryUser, {
    type:   QueryTypes.SELECT
    })

    return  res.json({ data: usersList });

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to get data user`,
    });
  }
};



// add user ke role
export const postUserToRole = async (req, res) => {
  try {  
    const {ROLE_ID, USER_ID} = req.body
    if(!ROLE_ID || !USER_ID) return res.status(202).json({message : 'Required Role And User Id'}) 
    //check dulu apa kah USER ID Sudah ada di role tersebut
    const checkUserOnRole = await Users.findOne({
      where : {
        ROLE_ID: ROLE_ID,
        USER_ID : USER_ID
      }
    })

    if(checkUserOnRole){
      return res.status(202).json({message : 'User Already on Role'})
    }

    const findAccessRole = await XrefRoleAccess.findAll({
      where : {
        ROLE_ID : ROLE_ID
      },
      raw : true
    })

    if(findAccessRole.length === 0){
      return res.status(404).json({message: 'No Data Access In Role, Pls Setting Auttorization First'})
    }

    const newAccsUser = findAccessRole.map(item => ({...item, USER_ID: USER_ID}))

    const deleteAccsUserRole = await UserAcc.destroy({
      where : { 
        USER_ID : USER_ID
      }
    })


    const newUserRoleAcc = await UserAcc.bulkCreate(newAccsUser)

    if(newUserRoleAcc){
      const updateUser = await Users.update({ROLE_ID : ROLE_ID}, {
        where: {
          USER_ID : USER_ID
        }
      })
      return  res.json({ message: 'Success add User to Role' });
    }else{
      return  res.status(404).json({ message: 'Error add User to role' });
    }

  } catch (error) {    
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to get data user`,
    });
  }
};

export const deleteUserFromRole = async (req, res) => {
  try {  
    const {userId} = req.params
    const updateUser = await Users.update({ROLE_ID : null}, {
        where: {
          USER_ID : userId
        }
      })
      if(updateUser){
        return  res.json({ message: 'Success Rempve User From Role' });
      }else{
        return  res.status(404).json({ message: 'Success Rempve User From Role' });
      }

  } catch (error) {
    console.log(error);
    
      return res.status(500).json({
        success: false,
        message: `Failed to delete data user`,
    });
  }
};
