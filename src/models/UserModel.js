import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } from "../config/secret.js";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const authenticationSchema = new Schema(
    {
        password: {
            type: String,
            required: true,
            minlength: [6, "Password must be at least 6 characters long."],
            trim: true,
            select: false
        },
        role: {
            type: String,
            enum: ["user", "admin", "moderator"],
            default: "user",
            select: false
        },
        tempMail: {
            type: String,
            select: false
        },
        confirmationToken: {
            type: String,
            select: false
        },
        resetPasswordToken: {
            type: String,
            select: false
        },
        changeEmailConfirmationToken: {
            type: String,
            select: false
        },
        isAccountConfirmed: {
            type: Boolean,
            default: false,
            select: false
        },
        refreshToken: {
            type: String
        }
    },
    { _id: false }
);

const addressSchema = new Schema(
    {
        street: {
            type: String,
            trim: true,
            minlength: 3,
            maxlength: 100
        },
        city: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        state: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 50
        },
        postalCode: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[A-Za-z0-9\s\-]{5,10}$/.test(v);
                },
                message: props => `${props.value} is not a valid postal code!`
            }
        },
        country: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 50
        }
    },
    { _id: false }
);

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50,
            trim: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: 30,
            trim: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: email => emailRegex.test(email),
                message: "Invalid email format"
            }
        },
        avatar: {
            url: {
                type: String,
                trim: true,
                default: "https://robohash.org/420f2159f7e162ecf561bce8221c732a?set=set4&bgset=&size=400x400"
            },
            id: {
                type: String
            }
        },
        phone: {
            type: Number
        },
        isBanned: {
            type: Boolean,
            default: false,
            select: false
        },
        address: addressSchema,
        authentication: authenticationSchema
    },
    { timestamps: true }
);

// =====================================================================================================================
// Hash user password before save them into DB
// =====================================================================================================================
userSchema.pre("save", async function (next) {
    if (!this.isModified("authentication.password")) return next();

    this.authentication.password = await bcrypt.hash(this.authentication.password, 10);
    next();
});

// ================================================
// Static method to find a user by email
// ================================================
userSchema.statics.findByEmail = async function (email) {
    try {
        // 'this' refers to the UserModel created using userSchema
        return await this.findOne({ email });
    } catch (error) {
        // Handle errors gracefully, perhaps log them
        console.error("Error finding user by email:", error);
        throw error;
    }
};

// =================================
// Instance methods
// =================================
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.authentication.password);
};

userSchema.methods.generateSafeObject = function () {
    return {
        _id: this._id,
        fullName: this.fullName,
        username: this.username,
        email: this.email,
        avatar: this.avatar,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

userSchema.methods.generateAccessToken = function (role = "user") {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function (role = "user") {
    return jwt.sign(
        {
            _id: this._id,
            role
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    );
};

const User = model("User", userSchema);

export default User;
