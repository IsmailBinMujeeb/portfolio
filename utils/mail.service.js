import Mailgen from "mailgen";
import { Resend } from "resend";
import env from "../config/env.js";

const adminVerificationMailContent = (token) => {
    return {
        body: {
            name: "Ismail",
            intro: "This is a request to for admin verification. You or maybe someone tried to logged In (Be careful before proceed).",
            action: {
                instructions:
                    "To verify your request, please click the following button (Ignore if you're not familiar):",
                button: {
                    color: "#E0234E",
                    text: "Verify that you tried to log in",
                    link: `${env.BASE_URL}/admin-verification?token=${token}`,
                },
            },
            outro:
                "If you didn't try to log in, someone else might be attempting to access your admin account. Please be cautious.",
        },
    };
};


export default async function sendMail(token) {

    const mailgen = new Mailgen({
        theme: "default",
        product: {
            name: "Ismail Bin Mujeeb Portfolio",
            link: env.BASE_URL
        }
    });

    const content = adminVerificationMailContent(token);

    const plainText = mailgen.generatePlaintext(content);
    const html = mailgen.generate(content);

    try {

        const resent = new Resend(env.RESEND_API);

        await resent.emails.send({
            from: `onboarding@resend.dev`,
            to: env.ADMIN_EMAIL,
            subject: 'Admin verification request',
            text: plainText,
            html
        });
    } catch (error) {
        if (env.isDevelopment()) console.log(error);
    }
}