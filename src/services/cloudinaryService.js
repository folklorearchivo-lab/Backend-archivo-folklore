const cloudinary = require('../config/cloudinary');

// Sube un buffer en memoria (el que entrega Multer) a Cloudinary sin pasar por disco.
function subirBuffer(buffer, { folder, publicId } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { subirBuffer };
