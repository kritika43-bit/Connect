const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getSignedImageUrl = async (key) => {
  if (!key) return null;
  // If it's already a full URL (not from our avatars/ folder), return it
  if (key.startsWith('http') && !key.includes(process.env.AWS_BUCKET_NAME)) return key;
  
  // Extract key if it's a full S3 URL
  const s3Key = key.includes('amazonaws.com/') ? key.split('amazonaws.com/')[1] : key;

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
  });

  // URL expires in 1 hour
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `avatars/${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images are allowed!'), false);
    }
  },
});

module.exports = { upload, getSignedImageUrl };
