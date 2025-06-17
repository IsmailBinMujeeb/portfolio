import env from "../config/env.js"
import { VALID_SKILL_LEVELS } from "../constants.js";
import skillModel from "../models/skill.model.js";

export const skillPage = async (req, res) => {

    try {
        const skills = await skillModel.find({});

        if (!skills.length) return res.render("skills/skill", { skills: null, isAdmin: req.isAdmin });

        return res.render("skills/skill", { skills, isAdmin: req.isAdmin });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createSkillPage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a skill.", back_link: "/" } })
        return res.render("skills/create.skill.ejs")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createSkillController = async (req, res) => {

    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a skill.", back_link: "/" } })

        const { skill_name, skill_level, skill_details } = req.body;

        if (!skill_name || !skill_level || !VALID_SKILL_LEVELS.includes(skill_level) || !skill_details) return res.render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to create a skill.", back_link: "/skill/create" } });

        const skill_name_regex = new RegExp(`^${skill_name}$`, 'i');

        const isSkillExist = await skillModel.findOne({
            skill_name: skill_name_regex,
        });

        if (isSkillExist) return res.status(409).render("error", { error: { status: 409, message: "Conflict", cause: "The skill already exist with the same name in the database, you can change the name of your new or old skills.", back_link: "/skill/create" } });

        const newSkill = await skillModel.create({
            skill_name,
            skill_details,
            skill_level
        });

        if (!newSkill) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The skill creation as been failed due to a server or database error.", back_link: "/skill/create" } });

        return res.redirect("/skill")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateSkillPage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a skill.", back_link: "/" } });

        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the skill id is missing or invalid, which is required to update this skill", back_link: "/" } });

        const skill = await skillModel.findById(id)

        if (!skill) return res.status(404).render("error", { error: { status: 404, message: "Skill Not Found", cause: "The skill you were trying to update was not exist, you might check the skill id first.", back_link: "/" } });
        return res.render("skills/update.skill.ejs", { skill });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateSkillController = async (req, res) => {
    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a skill.", back_link: "/" } });

        const { skill_name, skill_level, skill_details } = req.body;
        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the skill id is missing or invalid, which is required to update this skill", back_link: "/" } })

        if (!skill_name || !skill_level || !VALID_SKILL_LEVELS.includes(skill_level) || !id || !skill_details) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to update a skill.", back_link: "/skill" } });

        const isSkillExist = await skillModel.findById(id);

        if (!isSkillExist) return res.status(404).render("error", { error: { status: 404, message: "Skill Not Found", cause: "The skill you were trying to update was not exist, you might check the skill id first.", back_link: "/" } });

        const updatedSkill = await skillModel.findOneAndUpdate(
            { _id: id },
            {
                skill_name,
                skill_details,
                skill_level
            },
            { new: true });

        if (!updatedSkill) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The skill updation as been failed due to a server or database error.", back_link: "/skill" } });

        return res.redirect("/skill")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}