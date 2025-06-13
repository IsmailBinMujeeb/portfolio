import app from "./server.js";
import db from "./config/db.js";
import env from "./config/env.js";

; (
    async function () {
        try {
            await db();

            app.listen(app.get("port"), () => {
                if (env.isDevelopment()) console.log(`Server is running at ${app.get('port')}`);
            })

        } catch (error) {

            if (env.isDevelopment()) console.error("error while starting the server", error.message)
        }
    }
)()