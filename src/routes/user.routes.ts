import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/user", getUsers);
router.post("/user", createUser);
router.put("/user", updateUser);
router.delete("/user/:id", deleteUser)

export default router;