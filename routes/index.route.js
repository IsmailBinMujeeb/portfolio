import { Router } from "express";

import { index, dashboard, adminLogin, adminVerification } from "../controllers/index.controller.js";
import adminAuthentication from "../middleware/admin.authentication.middleware.js";

const router = Router();

router.get("/", adminAuthentication, index);
router.get("/dashboard", adminAuthentication, dashboard);
router.post("/admin-login", adminLogin);
router.get("/admin-verification", adminVerification)

export default router;
