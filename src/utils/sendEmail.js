import nodemailer from "nodemailer";
import chalk from "chalk";

import { DEVELOPER_NAME, DEVELOPER_EMAIL } from "../constants/index.js";
import { GMAIL_USERNAME, GMAIL_PASSWORD } from "../config/secret.js";

const sendEmail = async (recipient, subject, htmlContent) => {
    try {
        // Create a Nodemailer transporter using SMTP
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587, // Your SMTP server port (usually 587 for TLS)
            secure: false, // true for 465, false for other ports
            auth: {
                user: GMAIL_USERNAME,
                pass: GMAIL_PASSWORD
            }
        });

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: `${DEVELOPER_NAME} ${DEVELOPER_EMAIL}`,
            to: recipient,
            subject: subject,
            html: htmlContent
        });

        console.log(chalk.bold.yellow("\n✔ Message sent successfully: %s \n", info.messageId));
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(chalk.bold.red("\n✘ Error occurred while sending email:\n", error));
        return { success: false, error: error.message };
    }
};

export default sendEmail;
