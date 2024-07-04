import { ALLOWED_CORS_ORIGIN } from "../constants/index.js";

const corsOptions = {
    origin: ALLOWED_CORS_ORIGIN,
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true // Allow credentials (cookies, HTTP authentication) to be sent with requests.
};

export default corsOptions;
