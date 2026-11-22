const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadImage = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'campus_sell_buy/products',
        resource_type: 'image',
      });
      // Delete temporary local file after Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    } catch (err) {
      console.error('Cloudinary upload error, falling back to local:', err.message);
    }
  }

  // Fallback to local file URL
  const filename = path.basename(file.path);
  return {
    url: `/uploads/${filename}`,
    public_id: filename
  };
};

const deleteImage = async (public_id) => {
  if (!public_id) return;

  if (isCloudinaryConfigured && !public_id.includes('.')) {
    try {
      await cloudinary.uploader.destroy(public_id);
    } catch (err) {
      console.error('Cloudinary delete error:', err.message);
    }
  } else {
    // Local file cleanup
    const localPath = path.join(__dirname, '..', 'uploads', path.basename(public_id));
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
      } catch (err) {
        console.error('Local file delete error:', err.message);
      }
    }
  }
};

module.exports = {
  uploadImage,
  deleteImage
};
