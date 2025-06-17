import { Router } from "express";

import { skillPage, createSkillPage, createSkillController, updateSkillController, updateSkillPage } from "../controllers/skill.controller.js";

import adminAuthentication from "../middleware/admin.authentication.middleware.js";

const router = Router();

router.get("/", adminAuthentication, skillPage);
router.get("/create", adminAuthentication, createSkillPage);
router.post("/create", adminAuthentication, createSkillController);
router.get("/update/:id", adminAuthentication, updateSkillPage);
router.post("/update/:id", adminAuthentication, updateSkillController);

export default router;