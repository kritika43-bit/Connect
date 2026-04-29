const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure S3 client
const s3Config = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Configure Multer to use S3
const upload = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: process.env.S3_BUCKET_NAME || 'your_bucket_name',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'avatars/' + uniqueSuffix + '-' + file.originalname);
    }
  })
});

module.exports = upload;
