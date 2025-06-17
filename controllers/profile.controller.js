import env from "../config/env.js";
import profileModel from "../models/profile.model.js";
import { create, remove } from "../utils/cloudinary.service.js";
import { DEFAULT_PROFILE_IMAGE } from "../constants.js";

export const updateProfileController = async (req, res) => {

    try {

        const { hero_section_description } = req.body;

        if (!hero_section_description) return res.status(400).json({ error: "hero_section_description was not provided" });

        if (!req?.file) {
            const emailRegex = new RegExp(`^${env.ADMIN_EMAIL}$`, "i")
            const updatedProfile = await profileModel.findOneAndUpdate({
                admin_email: emailRegex,
            }, {
                hero_section_description,
            });

            if (!updatedProfile) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The profile updation as been failed due to a server or database error.", back_link: "/profile" } });
            return res.redirect("/");
        }

        const hero_section_image = await create(req?.file?.path);

        const emailRegex = new RegExp(`^${env.ADMIN_EMAIL}$`, "i")
        const updatedProfile = await profileModel.findOneAndUpdate({
            admin_email: emailRegex,
        }, {
            hero_section_description,
            hero_section_image
        });

        if (!updatedProfile) return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "The profile updation as been failed due to a server or database error.", back_link: "/profile" } });

        if (updatedProfile.hero_section_image !== DEFAULT_PROFILE_IMAGE) remove(updatedProfile.hero_section_image);

        return res.redirect("/");

    } catch (error) {

        if (env.isDevelopment()) console.log(error);
        return res.status(500).render("error", { error: { status: 500, message: "Internal server error", cause: "This is a server error please come back later.", back_link: "/" } })
    }
}