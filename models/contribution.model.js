import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema({
    contribution_name: {
        type: String,
        minLength: 4,
        required: [true, "contribution_name is required field in contribution model"],
        unique: [true, "contribution_name must be unique in contribution model"]
    },
    contribution_description: {
        type: String,
        required: [true, "contribution_description is required field in the contribution model"]
    },
    contribution_link: {
        type: String,
        required: [true, "contribution_link is required in contribution model"]
    }
});

export default mongoose.model("contribution", contributionSchema);
