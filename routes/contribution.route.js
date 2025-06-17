import { Router } from "express";

import { contributionPage, createContributionController, createContributionPage, updateContributionController, updateContributionPage } from "../controllers/contribution.controller.js";

import adminAuthentication from "../middleware/admin.authentication.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.get("/", adminAuthentication, contributionPage);
router.get("/create", adminAuthentication, createContributionPage);
router.post("/create", adminAuthentication, upload.single("Contribution_image"), createContributionController);
router.get("/update/:id", adminAuthentication, updateContributionPage);
router.post("/update/:id", adminAuthentication, upload.single("Contribution_image"), updateContributionController);

export default router;