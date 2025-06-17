import env from "../config/env.js"
import contributionModel from "../models/contribution.model.js";

export const contributionPage = async (req, res) => {

    try {
        const contributions = await contributionModel.find({});

        if (!contributions.length) return res.render("contributions/contribution", { contributions: null, isAdmin: req.isAdmin });

        return res.render("contributions/contribution", { contributions, isAdmin: req.isAdmin });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createContributionPage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a contribution.", back_link: "/" } });

        return res.render("contributions/create.contribution.ejs")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createContributionController = async (req, res) => {

    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a contribution.", back_link: "/" } })

        const { contribution_name, contribution_description, contribution_link } = req.body;

        if (!contribution_name || !contribution_description || !contribution_link) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to create a contribution.", back_link: "/contribution/create" } });

        const contribution_name_regex = new RegExp(`^${contribution_name}$`, 'i');

        const isContributionExist = await contributionModel.findOne({
            contribution_name: contribution_name_regex,
        });

        if (isContributionExist) return res.status(409).render("error", { error: { status: 409, message: "Conflict", cause: "The contribution already exist with the same name in the database, you can change the name of your new or old contributions.", back_link: "/contribution/create" } });

        const newContribution = await contributionModel.create({
            contribution_name,
            contribution_description,
            contribution_link,
        });

        if (!newContribution) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The contribution creation as been failed due to a server or database error.", back_link: "/contribution/create" } });

        return res.redirect("/contribution")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateContributionPage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a contribution.", back_link: "/" } });

        const { id } = req.params;

        if (!id) return res.render("error", { error: { status: 400, message: "Bad Request", cause: "the contribution id is missing or invalid, which is required to update this contribution", back_link: "/" } });

        const contribution = await contributionModel.findById(id);

        if (!contribution) return res.status(404).render("error", { error: { status: 404, message: "Contribution Not Found", cause: "The contribution you were trying to update was not exist, you might check the contribution id first.", back_link: "/" } });
        return res.render("contributions/update.contribution.ejs", { contribution });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateContributionController = async (req, res) => {
    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a contribution.", back_link: "/" } });

        const { contribution_name, contribution_description, contribution_link } = req.body;

        if (!contribution_name || !contribution_description || !contribution_link) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to update a contribution.", back_link: "/contribution" } });
        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the contribution id is missing or invalid, which is required to update this contribution", back_link: "/" } })

        const isContributionExist = await contributionModel.findById(id);

        if (!isContributionExist) return res.status(404).render("error", { error: { status: 404, message: "Contribution Not Found", cause: "The contribution you were trying to update was not exist, you might check the contribution id first.", back_link: "/" } });

        const updatedContribution = await contributionModel.findOneAndUpdate(
            { _id: id },
            {
                contribution_name,
                contribution_description,
                contribution_link
            },
            { new: true });

        if (!updatedContribution) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The contribution updation as been failed due to a server or database error.", back_link: "/contribution" } });

        return res.redirect("/contribution")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}