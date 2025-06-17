import { Router } from "express";

import { createServiceController, createServicePage, servicePage, updateServiceController, updateServicePage, readServicePage } from "../controllers/service.controller.js";

import adminAuthentication from "../middleware/admin.authentication.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.get("/", adminAuthentication, servicePage);
router.get("/s/:id", adminAuthentication, readServicePage);
router.get("/create", adminAuthentication, createServicePage);
router.post("/create", adminAuthentication, upload.single("service_image"), createServiceController);
router.get("/update/:id", adminAuthentication, updateServicePage);
router.post("/update/:id", adminAuthentication, upload.single("service_image"), updateServiceController);

export default router;