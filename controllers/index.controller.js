import env from "../config/env.js";
import crypto from "crypto";
import profileModel from "../models/profile.model.js";
import sendMail from "../utils/mail.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import skillModel from "../models/skill.model.js";
import serviceModel from "../models/service.model.js";
import projectModel from "../models/project.model.js";
import contributionModel from "../models/contribution.model.js";
import blogModel from "../models/blog.model.js";

export const index = async (req, res) => {

    try {

        const profilePromise = profileModel.findOne({
            admin_email: new RegExp(`^${env.ADMIN_EMAIL}$`, 'i')
        });

        const [profile, skills, projects, blogs, services] = await Promise.all([
            profilePromise,
            skillModel.find({}),
            projectModel.find({}).populate("project_stack"),
            blogModel.aggregate([
                {
                    $match: { is_featured: true }
                },
                {
                    $addFields: {
                        blog_short_description: {
                            $concat: [
                                {
                                    $substr: ["$blog_description", 0, 200],

                                },
                                "..."
                            ]
                        },

                        creation_date: {
                            $dateToString: {
                                date: "$createdAt",
                                format: "%Y-%m-%d",
                                onNull: "not mentioned"
                            }
                        },

                        last_update: {
                            $dateToString: {
                                date: "$createdAt",
                                format: "%Y-%m-%d",
                                onNull: "not mentioned"
                            }
                        }
                    }
                }
            ]),
            serviceModel.aggregate([
                {
                    $addFields: {
                        service_short_description: {
                            $concat: [
                                {
                                    $substr: ["$service_description", 0, 50],
                                },
                                "..."
                            ],
                        },
                        service_short_name: {
                            $concat: [
                                {
                                    $substr: ["$service_name", 0, 50],
                                },
                                "..."
                            ],
                        }
                    }
                }
            ])
        ]);

        res.render("index", { profile, skills, projects, blogs, services, isAdmin: req.isAdmin });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const dashboard = async (req, res) => {

    try {

        const tab = req.query?.tab || "skills";

        const emailRegex = new RegExp(`^${env.ADMIN_EMAIL}$`, "i");
        const profile = await profileModel.findOne({ admin_email: emailRegex });

        let data = undefined;

        if (tab == "skills") {
            data = await skillModel.find({});
        } else if (tab == "services") {
            data = await serviceModel.find({});
        } else if (tab == "projects") {
            data = await projectModel.find({});
        } else if (tab == "contributions") {
            data = await contributionModel.find({});
        } else if (tab == "blogs") {
            data = await blogModel.find({});
        }

        return res.render("dashboard", { isAdmin: req.isAdmin, data, tab, profile });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const adminLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ error: "email or password is invalid" });

        if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) return res.status(401).json({ error: "credentials are invalid" });

        const isPasswordValid = await bcrypt.compare(password, env.ADMIN_PASSWORD);
        if (!isPasswordValid) return res.status(401).json({ error: "credentials are invalid" });

        const admin_verification_token = crypto.randomBytes(20).toString("hex");
        const admin_verification_token_expiry = Date.now() + 1000 * 60 * 5;

        const emailRegex = new RegExp(`^${env.ADMIN_EMAIL}$`, 'i')

        const admin = await profileModel.findOneAndUpdate({
            admin_email: emailRegex,
        }, {
            admin_verification_token,
            admin_verification_token_expiry
        });

        if (!admin) return res.status(500).json({ error: "admin updation failed" });

        await sendMail(admin_verification_token);

        return res.send("<h1>Admin Verification email has been sended.</h1>");
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const adminVerification = async (req, res) => {

    try {
        const { token } = req.query;

        if (!token) return res.status(400).json({ erorr: "invalid credentials" });

        const admin = await profileModel.findOne({
            admin_verification_token: token,
            admin_verification_token_expiry: {
                $gt: Date.now(),
            }
        });

        if (!admin) return res.status(403).json({ error: "token expired or used" });

        admin.admin_verification_token = null;
        admin.admin_verification_token_expiry = null;

        await admin.save();

        const admin_token = jwt.sign({ email: admin.admin_email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY });

        res.cookie("admin_token", admin_token, { maxAge: 1000 * 60 * 60 * 24 });

        res.redirect("/dashboard");
    } catch (error) {

        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}