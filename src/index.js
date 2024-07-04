import dotenv from "dotenv/config";
import chalk from "chalk";

import app from "./app.js";
import connectDB from "./config/connect-db.js";
import { PORT } from "./config/secret.js";

(async () => {
    await connectDB();

    app.listen(PORT, err => {
        if (!err) {
            console.log(chalk.bold.magenta(`✓ Server is running at: http://localhost:${PORT}`));
        } else {
            console.log(chalk.bold.red(`✘ Failed to start server! CAUSE: ${err}`));
        }
    });
})();
