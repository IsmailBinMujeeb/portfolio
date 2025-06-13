import express from "express";
import env from "./config/env.js";

const app = express();
const PORT = env.PORT || 3000;

app.set("view engine", "ejs");
app.set("port", PORT)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

export default app;