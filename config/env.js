import { config } from "dotenv";

config();

const isDevelopment = () => {
    if (process.env.NODE_ENV === "dev") return true;
    return false
}

export default {
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    DATABASE_URI: process.env.DATABASE_URI,
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment,
}