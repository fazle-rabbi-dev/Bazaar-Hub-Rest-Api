import winston from "winston";

// Custom function to format timestamps in 12-hour format
const timestamp12Hour = winston.format((info, opts) => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    info.timestamp = `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    return info;
});

// Define a custom format with colors and 12-hour timestamp
const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create a logger with the custom format
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        timestamp12Hour(), // Use the custom 12-hour timestamp format
        winston.format.colorize(), // Apply colors
        myFormat // Use the custom format
    ),
    transports: [
        new winston.transports.Console() // Output to the console
    ]
});

export default logger;
