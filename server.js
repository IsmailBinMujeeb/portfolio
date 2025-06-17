import express from "express";
import env from "./config/env.js";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.route.js";
import profileRouter from "./routes/profile.route.js";
import skillRouter from "./routes/skill.route.js";
import projectRouter from "./routes/project.route.js";
import blogRouter from "./routes/blog.route.js";
import contributionRouter from "./routes/contribution.route.js";
import serviceRouter from "./routes/service.route.js";

const app = express();
const PORT = env.PORT || 3000;

app.set("view engine", "ejs");
app.set("port", PORT)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/profile", profileRouter);
app.use("/skill", skillRouter);
app.use("/project", projectRouter);
app.use("/blog", blogRouter);
app.use("/contribution", contributionRouter);
app.use("/service", serviceRouter);

export default app;