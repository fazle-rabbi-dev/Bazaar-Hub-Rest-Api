import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        slug: {
            type: String,
            unique: true,
            lowercase: true
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ]
    },
    { timestamps: true }
);

categorySchema.pre("save", async function (next) {
    // Check if the name field is modified or if the slug is not set
    if (!this.isModified("name")) return next();

    // Generate the slug from the name field
    this.slug = slugify(this.name, { lower: true, strict: true });

    next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
