import mongoose from "mongoose";
import env from "../config/env.js";
import blogModel from "../models/blog.model.js";
import { upsert, read } from "../utils/github.service.js";
import { marked } from "marked";

export const blogsPage = async (req, res) => {

    try {
        const blogs = await blogModel.aggregate([
            {
                $match: {},
            },

            {
                $addFields: {
                    date: {
                        $dateToString: {
                            date: "$createdAt",
                            format: "%Y-%m-%d",
                            onNull: "not mentioned"
                        }
                    },

                    blog_short_description: {
                        $concat: [
                            {
                                $substr: ["$blog_description", 0, 200],
                            },
                            "..."
                        ]
                    }
                }
            }
        ]);

        if (!blogs.length) return res.render("blogs/blog.ejs", { blogs: null, isAdmin: req.isAdmin });
        return res.render("blogs/blog.ejs", { blogs, isAdmin: req.isAdmin });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const readBlogPage = async (req, res) => {

    try {
        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Invalid blog id", cause: "This error is cause due to the invalid id in the url parameter.", back_link: "/" } });

        const blog = await blogModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                },
            },
            {
                $addFields: {
                    creation_date: {
                        $dateToString: {
                            date: "$createdAt",
                            format: "%Y-%m-%d",
                            onNull: "not mentioned",
                        }
                    },

                    last_update: {
                        $dateToString: {
                            date: "$updatedAt",
                            format: "%Y-%m-%d",
                            onNull: "not mentioned",
                        }
                    },
                }
            }
        ]);

        if (!blog.length) return res.status(404).render("error", { error: { status: 404, message: "Blog Not Found", cause: "The blog was not exist or might be deleted.", back_link: "/" } });

        const html = marked.parse(await read(`blog_${blog[0]._id}.md`));

        return res.render("blogs/read.blog.ejs", { blog: { _id: blog[0]._id, content: html, title: blog[0].blog_title, creation_date: blog[0].creation_date, last_update: blog[0].last_update }, isAdmin: req.isAdmin })
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createBlogPage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a blog.", back_link: "/" } });

        return res.render("blogs/create.blog.ejs");
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })

    }
}

export const createBlogController = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a blog.", back_link: "/" } });

        const { blog_title, blog_description, is_featured } = req.body;

        if (!blog_title || !blog_description) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "Blog title or description was not provided which is required to create a blog.", back_link: "/blog/create" } });
        if (!req.file) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "Blog markdown file was not provided which is required to create a blog.", back_link: "/blog/create" } })

        const blogTitleRegex = new RegExp(`^${blog_title}$`, 'i');
        const isBlogExist = await blogModel.findOne({
            blog_title: blogTitleRegex,
        });

        if (isBlogExist) return res.status(409).render("error", { error: { status: 409, message: "Conflict", cause: "The blog already exist with the same title in the database, you can change the title of your new or old blogs.", back_link: "/blog/create" } });

        const newBlog = await blogModel.create({
            blog_title,
            blog_description,
            is_featured: is_featured == "on" ? true : false,
        });

        if (!newBlog) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The blog creation as been failed due to a server or database error.", back_link: "/blog/create" } });

        const blog_content_url = await upsert(req.file.path, `blog_${newBlog._id}.md`);

        newBlog.blog_content_url = blog_content_url;
        await newBlog.save();

        return res.redirect(`/blog/b/${newBlog._id}`);
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/blog/create" } })
    }
}

export const updateBlogPage = async (req, res) => {
    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a blog.", back_link: "/" } });

        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the blog id is missing or invalid, which is required to update this blog", back_link: "/" } });

        const blog = await blogModel.findById(id);

        if (!blog) return res.status(404).render("error", { error: { status: 404, message: "Blog Not Found", cause: "The blog you were trying to update was not exist, you might check the blog id first.", back_link: "/" } })

        return res.render("blogs/update.blog.ejs", { blog });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/blog/create" } })
    }
}

export const updateBlogController = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a blog.", back_link: "/" } });

        const { id } = req.params;
        const { blog_title, blog_description, is_featured } = req.body;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the blog id is missing or invalid, which is required to update this blog", back_link: "/" } });

        const blog_content_url = req.file ? await upsert(req.file.path, `blog_${id}.md`) : undefined;

        if (!blog_title && !blog_description && !blog_content_url && !is_featured) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to update a blog.", back_link: "/blog" } });

        const isBlogExist = await blogModel.findById(id);

        if (!isBlogExist) return res.status(404).render("error", { error: { status: 404, message: "Blog Not Found", cause: "The blog you were trying to update was not exist, you might check the blog id first.", back_link: "/" } });

        const updatedBlog = await blogModel.findByIdAndUpdate(id, {
            blog_title: blog_title || isBlogExist.blog_title,
            blog_description: blog_description || isBlogExist.blog_description,
            blog_content_url: blog_content_url || isBlogExist.blog_content_url,
            is_featured: is_featured === "on" ? true : false,
        });

        if (!updatedBlog) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The blog updation as been failed due to a server or database error.", back_link: "/blog" } });

        return res.redirect(`/blog/b/${id}`)
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/blog/create" } })
    }
}