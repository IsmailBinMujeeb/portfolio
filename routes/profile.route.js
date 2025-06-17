import { Router } from "express";

import { updateProfileController } from "../controllers/profile.controller.js";
import upload from "../middleware/multer.middleware.js";
import adminAuthentication from "../middleware/admin.authentication.middleware.js";

const router = Router();

router.post("/", adminAuthentication, upload.single('hero_section_image'), updateProfileController);

export default router;