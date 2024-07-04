import slugify from "slugify";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        stock: { type: Number, required: true },
        category: {
            type: String,
            required: true,
            lowercase: true
        },
        brand: { type: String },
        color: { type: String },
        size: { type: String },
        weight: { type: Number },
        rating: { type: Number, default: 0 },
        ratingsCount: { type: Number, default: 0 },
        sold: {
            type: Number,
            default: 0
        },
        shipping: {
            type: Number,
            default: 0
        },
        image: {
            url: { type: String },
            publicId: { type: String }
        }
    },
    { timestamps: true }
);

productSchema.pre("save", async function (next) {
    // Check if the name field is modified or if the slug is not set
    if (!this.isModified("name")) return next();

    // Generate the slug from the name field
    this.slug = slugify(this.name, { lower: true, strict: true });

    next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
