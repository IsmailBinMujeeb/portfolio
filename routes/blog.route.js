import { Router } from "express";

import { blogsPage, createBlogController, createBlogPage, readBlogPage, updateBlogController, updateBlogPage } from "../controllers/blog.controller.js";
import adminAuthentication from "../middleware/admin.authentication.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.get("/", adminAuthentication, blogsPage);
router.get("/b/:id", adminAuthentication, readBlogPage);
router.get("/create", adminAuthentication, createBlogPage);
router.post("/create", adminAuthentication, upload.single("blog_content"), createBlogController);
router.get("/update/:id", adminAuthentication, updateBlogPage);
router.post("/update/:id", adminAuthentication, upload.single("blog_content"), updateBlogController);

export default router;