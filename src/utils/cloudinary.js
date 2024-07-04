import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "../config/secret.js";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
});

class Cloudinary {
    static uploadFile = async (localFilePath, uploadDir) => {
        try {
            if (!localFilePath) return null;

            //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder: uploadDir
            });

            console.log("file is uploaded on cloudinary ", response.url);

            fs.unlinkSync(localFilePath);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath);
            console.log(error);
            return null;
        }
    };

    static deleteFile = async publicId => {
        try {
            const res = await cloudinary.uploader.destroy(publicId);
            console.log("File deleted successfully from cloudinary.");
            console.log({ res });

            return res;
        } catch (error) {
            console.error(`\nError occured while deleting file from cloudinary.js. Cause: ${error}`);
            return null;
        }
    };
}

export default Cloudinary;
