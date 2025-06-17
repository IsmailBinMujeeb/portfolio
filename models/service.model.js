import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema({
    service_name: {
        type: String,
        required: [true, "service_name is required in service model"],
        unique: [true, "service_name must be unique in service model"]
    },

    service_description: {
        type: String,
        required: [true, "service_description is required in service model"],
    },

    service_price: {
        type: Number,
        required: [true, "service_price is required in service model"],
    },

    service_image: {
        type: String,
        required: [true, "service_image is required in service model"],
    },

    service_link: {
        type: String,
        required: [true, "service_link is required in service model"],
    },

    service_provider: {
        type: String,
        required: [true, "service_provider is required in service model"],
    }
}, { timestamps: true });

export default mongoose.model("service", servicesSchema);