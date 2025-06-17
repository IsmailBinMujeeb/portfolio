import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    blog_title: {
        type: String,
        minLength: 4,
        required: [true, "blog_title is required field in blog model"],
        unique: [true, "blog_title must be unique in blog model"],
    },

    blog_description: {
        type: String,
        required: [true, "blog_description is required field in blog model"]
    },

    blog_content_url: {
        type: String,
        default: "",
    },

    is_featured: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

export default mongoose.model("blog", blogSchema);