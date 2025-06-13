import mongoose from "mongoose";
import env from "./env.js";

export default async () => {

    try {
        await mongoose.connect(env.DATABASE_URI);
        if (env.isDevelopment()) console.log("Database connected");
    } catch (error) {
        if (env.isDevelopment()) console.error("Database connection failed",)
    }
}