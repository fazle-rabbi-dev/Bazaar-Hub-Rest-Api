import { DEVELOPER_NAME, PROJECT_NAME } from "../constants/index.js";

// Function to generate HTML email template for account confirmation
const generateAccountConfirmationEmail = (userName, link) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Confirmation</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Patrick+Hand&display=swap');
            
            body {
                font-family: Inter, Arial, sans-serif;
                background-color: #f2f2f2;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
            }
            h2 {
                color: #333333;
            }
            p {
                color: #666666;
            }
            .btn {
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hello ${userName},</h2>
            <p>Please click the button below to confirm your account:</p>
            <br />
            <a href="${link}" class="btn">Confirm Account</a>
            <p><br />Regards,<br>${DEVELOPER_NAME}</p>
        </div>
    </body>
    </html>
    `;
};

// Function to generate HTML email template for password reset
const generatePasswordResetEmail = (userName, link) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Patrick+Hand&display=swap');
            
            body {
                font-family: Inter, Arial, sans-serif;
                background-color: #f2f2f2;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
            }
            h2 {
                color: #333333;
            }
            p {
                color: #666666;
            }
            .btn {
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password. Click the button below to reset your password:</p>
            <br />
            <a href="${link}" class="btn">Reset Password</a>
            <p><br />If you didn't request this, you can safely ignore this email.</p>
            <p>Regards,<br>${DEVELOPER_NAME}</p>
        </div>
    </body>
    </html>
    `;
};

const generateEmailChangeConfirmationEmail = (userName, link) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Confirmation</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Patrick+Hand&display=swap');
            
            body {
                font-family: Inter, Arial, sans-serif;
                background-color: #f2f2f2;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
            }
            h2 {
                color: #333333;
            }
            p {
                color: #666666;
            }
            .btn {
                background-color: #007bff;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hello ${userName},</h2>
            <p>We received a request to add this email to a ${PROJECT_NAME} account. Click the button below to confirm your email address:</p>
            <br />
            <a href="${link}" class="btn">Confirm Email</a>
            <p><br />If you didn't request this, you can safely ignore this email.</p>
            <p>Regards,<br>${DEVELOPER_NAME}</p>
        </div>
    </body>
    </html>
    `;
};

export { generateAccountConfirmationEmail, generatePasswordResetEmail, generateEmailChangeConfirmationEmail };
