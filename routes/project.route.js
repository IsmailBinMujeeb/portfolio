import { Router } from "express";

import { createProjectController, createProjectPage, projectPage, updateProjectController, updateProjectPage } from "../controllers/project.controller.js";

import adminAuthentication from "../middleware/admin.authentication.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.get("/", adminAuthentication, projectPage);
router.get("/create", adminAuthentication, createProjectPage);
router.post("/create", adminAuthentication, upload.single("project_image"), createProjectController);
router.get("/update/:id", adminAuthentication, updateProjectPage);
router.post("/update/:id", adminAuthentication, upload.single("project_image"), updateProjectController);

export default router;