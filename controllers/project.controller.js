import env from "../config/env.js"
import projectModel from "../models/project.model.js";
import skillModel from "../models/skill.model.js";
import { create, remove } from "../utils/cloudinary.service.js";
import { DEFAULT_PROJECT_IMAGE } from "../constants.js";

export const projectPage = async (req, res) => {

    try {
        const projects = await projectModel.find({}).populate("project_stack");

        if (!projects.length) return res.render("projects/project", { projects: null, isAdmin: req.isAdmin });

        return res.render("projects/project", { projects, isAdmin: req.isAdmin });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createProjectPage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a project.", back_link: "/" } });

        const skills = await skillModel.find({});
        return res.render("projects/create.project.ejs", { skills })
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createProjectController = async (req, res) => {

    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a project.", back_link: "/" } })

        const { project_name, project_description, project_stack, project_links } = req.body;

        if (!project_name || !project_description || !Array.isArray(project_links) || !project_stack || typeof project_stack !== "object") return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to create a project.", back_link: "/project/create" } });

        const project_name_regex = new RegExp(`^${project_name}$`, 'i');

        const isProjectExist = await projectModel.findOne({
            project_name: project_name_regex,
        });

        if (isProjectExist) return res.status(409).render("error", { error: { status: 409, message: "Conflict", cause: "The project already exist with the same name in the database, you can change the name of your new or old projects.", back_link: "/project/create" } });

        let project_image = undefined;

        if (req.file) {
            project_image = await create(req.file.path);
        }

        const newProject = await projectModel.create({
            project_name,
            project_description,
            project_image,
            project_links,
            project_stack: Object.keys(project_stack)
        });

        if (!newProject) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The project creation as been failed due to a server or database error.", back_link: "/project/create" } });

        return res.redirect("/project")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateProjectPage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a project.", back_link: "/" } });

        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the project id is missing or invalid, which is required to update this project", back_link: "/" } });

        const project = await projectModel.findById(id);
        const skills = await skillModel.find({});

        if (!project) return res.status(404).render("error", { error: { status: 404, message: "Project Not Found", cause: "The project you were trying to update was not exist, you might check the project id first.", back_link: "/" } });
        return res.render("projects/update.project.ejs", { project, skills });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateProjectController = async (req, res) => {
    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a project.", back_link: "/" } });

        const { project_name, project_description, project_stack, project_links } = req.body;

        if (!project_name || !project_description || !Array.isArray(project_links) || !project_stack || typeof project_stack !== "object") return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to update a project.", back_link: "/project" } });
        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the project id is missing or invalid, which is required to update this project", back_link: "/" } })

        const isProjectExist = await projectModel.findById(id);

        if (!isProjectExist) return res.status(404).render("error", { error: { status: 404, message: "Project Not Found", cause: "The project you were trying to update was not exist, you might check the project id first.", back_link: "/" } });

        let project_image = undefined;

        if (req.file) {
            project_image = await create(req.file.path)
        }

        const updatedProject = await projectModel.findOneAndUpdate(
            { _id: id },
            {
                project_name,
                project_description,
                project_links,
                project_image: project_image || isProjectExist.project_image,
                project_stack: Object.keys(project_stack)
            });

        if (!updatedProject) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The project updation as been failed due to a server or database error.", back_link: "/project" } });

        if (updatedProject.project_image !== DEFAULT_PROJECT_IMAGE) remove(updatedProject.project_image);

        return res.redirect("/project")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}