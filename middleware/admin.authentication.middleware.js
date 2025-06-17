import jwt from "jsonwebtoken";
import env from "../config/env.js";

export default async function adminAuthentication(req, res, next) {
    const token = req?.cookies?.admin_token;

    if (!token) return next();

    try {
        const { email } = jwt.verify(token, env.JWT_SECRET);

        if (email && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
            req.isAdmin = true;
        }
    } catch (err) {
        if (env.isDevelopment()) console.error("Admin auth error:", err.message);
        res.clearCookie("admin_token");
    }

    return next();
}
