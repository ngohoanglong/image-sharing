# Cloudinary Setup Guide

To get the photo upload functionality working with Cloudinary, follow these steps:

1. Create a Cloudinary Account:

   - Go to [Cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - No credit card required

2. Get Your Cloud Name:

   - After signing in, go to your Dashboard
   - Your cloud name is displayed at the top of the dashboard
   - Copy it and replace `your_cloud_name` in `config/cloudinary.ts`

3. Create an Upload Preset:

   - In the Cloudinary Dashboard, go to Settings > Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Set the following:
     - Signing Mode: Unsigned
     - Folder: Choose a folder name (e.g., "mobile-uploads")
     - Access Mode: public
   - Save the preset
   - Copy the preset name and replace `your_upload_preset` in `config/cloudinary.ts`

4. Optional Settings to Consider:

   - Enable auto-backup
   - Set image quality optimization
   - Configure image transformations
   - Set maximum file size limits

5. Free Tier Limits:

   - 25 credits/month
   - 1 credit ≈ 1000 transformations
   - 25GB monthly viewing bandwidth
   - Unlimited storage for images under 10MB
   - Auto-backup available
   - No expiry on stored images

6. Best Practices:

   - Use appropriate image sizes
   - Enable auto-format delivery
   - Use progressive loading
   - Implement error handling
   - Monitor usage in dashboard

7. Security Considerations:
   - Use upload presets instead of API key
   - Set proper access modes for uploads
   - Monitor upload activities
   - Set upload restrictions if needed

After completing these steps, the photo upload functionality will work with Cloudinary storage.

Note: The free tier is generous for most personal projects. If you need more:

- Optimize image sizes before upload
- Use proper image formats
- Monitor your usage in the dashboard
- Clear unused images periodically
