import Users from "../../models/setup/users.mod.js";
import bcryptjs from "bcryptjs";
import moment from "moment/moment.js";
import { qryGetAllRole, qryGetDeptAll, UserRole } from "../../models/setup/userAcces.mod.js";
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
  await Users.create(dataUser);
  res.json({
    // datanew: resData,
    message: "User Added",
  });
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


//controller Create role
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
