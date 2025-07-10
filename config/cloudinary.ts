import { Cloudinary } from "@cloudinary/url-gen";

// Initialize Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: "dpfsbp280", // Replace with your cloud name
  },
  url: {
    secure: true, // Force HTTPS
  },
});

// Cloudinary upload preset (Create this in your Cloudinary Dashboard)
export const UPLOAD_PRESET = "image-sharing";

// Cloudinary API endpoint
export const UPLOAD_URL = `https://api.cloudinary.com/v1_1/dpfsbp280/image/upload`;
