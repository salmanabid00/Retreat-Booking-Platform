const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () => {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
};

const uploadToCloudinary = (fileBuffer, folder = 'retreat_properties') => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      // Fallback to base64 data URL if Cloudinary credentials are not set
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      return resolve({
        url: dataUrl,
        public_id: `local_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = { cloudinary, isCloudinaryConfigured, uploadToCloudinary };
