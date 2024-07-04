class ApiResponse {
    constructor(statusCode, message, data) {
        this.success = true;
        this.statusCode = statusCode;
        this.message = message;
        if (data) this.data = data;
    }
}

export default ApiResponse;

export const successResponse = (res, data = {}) => {
    const payload = {
        status: true,
        statusCode: data?.statusCode || 200,
        message: data?.message || "Success"
    };
    if (data.data) payload.data = data.data;
    res.status(data?.statusCode || 200).json(payload);
};
