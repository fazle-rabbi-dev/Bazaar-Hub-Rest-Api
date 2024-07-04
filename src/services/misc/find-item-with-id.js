import ApiError from "../../utils/ApiError.js";
import { validateDocumentId } from "../../utils/helpers.js";

const findItemWithId = async (Model, id, options = {}, select = "") => {
    if (!validateDocumentId(id)) {
        throw new ApiError(
            400,
            `Uh-oh! It seems the ${Model.modelName} id is missing or invalid. Please provide a valid ${Model.modelName} id in the request path.`
        );
    }

    let item;
    if (select) {
        item = await Model.findById(id).select(select);
    } else {
        item = await Model.findById(id);
    }

    if (!item) {
        throw new ApiError(404, `${Model.modelName} not found with the given id.`);
    }

    return item;
};

export default findItemWithId;
