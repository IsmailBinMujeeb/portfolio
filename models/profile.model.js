import mongoose from "mongoose";
import { DEFAULT_PROFILE_IMAGE } from "../constants.js";

const profileSchema = new mongoose.Schema({

    admin_email: {
        type: String,
    },

    admin_password: {
        type: String,
    },

    hero_section_description: {
        type: String,
    },

    hero_section_image: {
        type: String,
        default: DEFAULT_PROFILE_IMAGE,
    },

    admin_verification_token: {
        type: String,
        default: null,
    },

    admin_verification_token_expiry: {
        type: Number,
        default: null
    }
});

export default mongoose.model("profile", profileSchema);