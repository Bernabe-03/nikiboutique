import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// Multer utilise la mémoire (buffer), pas un stockage Cloudinary déprécié
const storage = multer.memoryStorage();

// Filtrage des fichiers (images + vidéos)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Format d'image non supporté (JPEG, JPG, PNG, WEBP)"), false);
  }

  if (file.mimetype.startsWith("video/")) {
    const allowed = ["video/mp4", "video/mov", "video/avi", "video/webm"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Format vidéo non supporté (MP4, MOV, AVI, WEBM)"), false);
  }

  return cb(new Error("Seules les images et vidéos sont autorisées !"), false);
};

// Upload SIMPLE (ex: upload d'une seule image)
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB images
}).single("file");

// Upload MULTIPLE : images + vidéos
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // max 50MB par fichier
    files: 15, // limite totale
  },
}).fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);

// Upload images → Cloudinary
export const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "nono-vitrine/products/images",
        resource_type: "image",
        transformation: [
          { width: 800, height: 800, crop: "limit", quality: "auto" },
          { format: "auto" },
        ],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(file.buffer);
  });
};

// Upload vidéos → Cloudinary
export const uploadVideoToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "nono-vitrine/products/videos",
        resource_type: "video",
        transformation: [{ quality: "auto" }],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(file.buffer);
  });
};

// Gestion des erreurs Multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Erreur d'upload",
  });
};
