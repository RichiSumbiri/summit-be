import express from "express";
import { createRole, deleteUserFromRole, getAllDept, getAllMenus, getAllRole, getListUserRole, getUserForRole, postRoleAccess, postUserToRole, updateRole } from "../../controllers/setup/users.js";
const router = express.Router();


router.get("/getListDept", getAllDept);
router.get("/getall", getAllRole);
router.get("/getListMenu/:roleId", getAllMenus);
router.get("/list-user/:roleId", getListUserRole);
router.get("/get-user-for-role/:qry", getUserForRole);


router.post("/create", createRole); //create
router.patch("/create", updateRole); // update and delete


router.post("/access", postRoleAccess); //post access role
router.post('/add-user', postUserToRole)

router.delete('/delete-user/:userId', deleteUserFromRole)
export default router;
