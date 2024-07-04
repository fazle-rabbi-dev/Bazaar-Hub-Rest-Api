import mongoose from "mongoose";
import chalk from "chalk";

import logger from "../utils/logger.js";

import { DB_NAME } from "../constants/index.js";
import { MONGODB_URI } from "../config/secret.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
        logger.info("MongoDB connected");
    } catch (error) {
        console.log(chalk.bold.red("MONGODB connection FAILED "), error);
        process.exit(1);
    }
};

export default connectDB;
