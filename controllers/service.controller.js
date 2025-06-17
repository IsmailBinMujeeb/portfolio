import env from "../config/env.js"
import serviceModel from "../models/service.model.js";
import { create } from "../utils/cloudinary.service.js"

export const servicePage = async (req, res) => {

    try {
        const services = await serviceModel.aggregate([
            {
                $match: {},
            },

            {
                $addFields: {
                    service_short_description: {
                        $concat: [
                            {
                                $substr: ["$service_description", 0, 50],
                            },
                            "..."
                        ]
                    }
                }
            }
        ]);

        if (!services.length) return res.render("services/service", { services: null, isAdmin: req.isAdmin });

        return res.render("services/service", { services, isAdmin: req.isAdmin });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const readServicePage = async (req, res) => {

    try {
        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the skill id is missing or invalid, which is required to update this skill", back_link: "/" } });

        const service = await serviceModel.findById(id)

        if (!service) return res.status(404).render("error", { error: { status: 500, message: "Internal server error", cause: "The service updation as been failed due to a server or database error.", back_link: "/service" } });

        return res.render("services/read.service.ejs", { service, isAdmin: req.isAdmin })
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createServicePage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a service.", back_link: "/" } });

        return res.render("services/create.service.ejs")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const createServiceController = async (req, res) => {

    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to create a service.", back_link: "/" } })

        const { service_name, service_description, service_price, service_link, service_provider } = req.body;

        if (!service_name || !service_description || !service_link || !service_price || !service_provider) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to create a service.", back_link: "/skill" } });

        const service_name_regex = new RegExp(`^${service_name}$`, 'i');

        const isServiceExist = await serviceModel.findOne({
            service_name: service_name_regex,
        });

        if (isServiceExist) return res.status(409).render("error", { error: { status: 409, message: "Conflict", cause: "The service already exist with the same name in the database, you can change the name of your new or old services.", back_link: "/service/create" } });

        let service_image = undefined;

        if (req.file) {
            service_image = await create(req.file.path);
        }

        const newService = await serviceModel.create({
            service_name,
            service_description,
            service_image,
            service_link,
            service_price,
            service_provider
        });

        if (!newService) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The service creation as been failed due to a server or database error.", back_link: "/service/create" } });

        return res.redirect("/service")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateServicePage = async (req, res) => {

    try {
        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a service.", back_link: "/" } });

        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the service id is missing or invalid, which is required to update this service", back_link: "/" } });

        const service = await serviceModel.findById(id);

        if (!service) return res.status(404).render("error", { error: { status: 404, message: "Service Not Found", cause: "The service you were trying to update was not exist, you might check the service id first.", back_link: "/" } });
        return res.render("services/update.service.ejs", { service });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}

export const updateServiceController = async (req, res) => {
    try {

        if (!req.isAdmin) return res.status(401).render("error", { error: { status: 401, message: "Unauthorized Access", cause: "You don't have permissions to update a service.", back_link: "/" } });

        const { service_name, service_description, service_price, service_link, service_provider } = req.body;

        if (!service_name || !service_description || !service_link || !service_price || !service_provider) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "The required fields was not provided to update a service.", back_link: "/service" } });
        const { id } = req.params;

        if (!id) return res.status(400).render("error", { error: { status: 400, message: "Bad Request", cause: "the service id is missing or invalid, which is required to update this service", back_link: "/" } })

        const isServiceExist = await serviceModel.findById(id);

        if (!isServiceExist) return res.status(404).render("error", { error: { status: 404, message: "Service Not Found", cause: "The service you were trying to update was not exist, you might check the service id first.", back_link: "/" } });

        let service_image = undefined;

        if (req.file) {
            service_image = await create(req.file.path)
        }

        const updatedservice = await serviceModel.findOneAndUpdate(
            { _id: id },
            {
                service_name,
                service_description,
                service_link,
                service_image: service_image || isServiceExist.service_image,
                service_price,
                service_provider
            },
            { new: true });

        if (!updatedservice) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The service updation as been failed due to a server or database error.", back_link: "/service" } });

        return res.redirect("/service")
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}