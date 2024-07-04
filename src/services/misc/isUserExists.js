// TODO

import User from "../../models/UserModel.js";

const isUserExists = async _id => {
    const existingUser = await User.exists({ _id });

    if (!existingUser) {
        if (!currentUser) {
            throw new ApiError(404, "No user exists with the provided user ID.");
        }
    }
};

export default isUserExists;
