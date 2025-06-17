import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from "cloudinary-build-url";
import env from "../config/env.js";
import fs from "fs"

cloudinary.config({
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    cloud_name: env.CLOUDINARY_NAME
});

export const create = async (file) => {

    try {
        const response = await cloudinary.uploader.upload(file);

        fs.unlink(file, (e) => {
            if (e) if (env.isDevelopment()) console.log(e)
        });

        return response.url;
    } catch (error) {
        if (env.isDevelopment()) console.log(error)
        throw error
    }
}

export const getPublicId = (link) => {
    return extractPublicId(link);
}

export const remove = async (link) => {

    try {
        const publicId = getPublicId(link);

        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        if (env.isDevelopment()) console.log(error)
        throw error
    }
}