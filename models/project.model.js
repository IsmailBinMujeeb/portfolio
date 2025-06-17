import mongoose from "mongoose";
import { DEFAULT_PROJECT_IMAGE } from "../constants.js";

const linkSchema = new mongoose.Schema({
    link_name: {
        type: String,
        required: [true, "link_name is required field in the project model"]
    },
    link: {
        type: String,
        required: [true, "link is required field in the project model"]
    }
});

const projectSchema = new mongoose.Schema({
    project_name: {
        type: String,
        minLength: 4,
        required: [true, "project_name is required field in project model"],
        unique: [true, "project_name must be unique in project model"]
    },
    project_stack: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "skill",
        required: [true, "project_stack is required in project model"]
    }],
    project_image: {
        type: String,
        default: DEFAULT_PROJECT_IMAGE,
    },
    project_description: {
        type: String,
        required: [true, "project_description is required field in the project model"]
    },
    project_links: {
        type: [linkSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: "At least one project_link is required in the project model"
        }
    }
});

export default mongoose.model("project", projectSchema);
