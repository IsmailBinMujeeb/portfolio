import mongoose from "mongoose";
import { VALID_SKILL_LEVELS } from "../constants.js";

const skillSchema = new mongoose.Schema({
    skill_name: {
        type: String,
        minLength: 2,
        trim: true,
        required: [true, "skill_name field is required in skills model"],
        unique: [true, "skill_name field must be unique in skills model"]
    },
    skill_level: {
        type: String,
        required: [true, "skill_level field is required in skills model"],
        enum: VALID_SKILL_LEVELS
    },
    skill_details: {
        type: String,
        required: [true, "skill_details field is required in skills model"],
        trim: true,
    }
}, { timestamps: true });

export default mongoose.model("skill", skillSchema);
