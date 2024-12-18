import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET_NAME',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is missing`);
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME!;

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const uploadFileToS3 = async (file: any) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: `${file.name}`,
      Body: file.data,
      ContentType: file.mimetype,
    };

    return await s3.upload(params).promise();

  } catch (error) {
    console.log("======================= ERROR ==========================");
    console.log(error);
    console.log("========================<><><>==========================");
  }
};

export const generatePresignedUrlForGetObject = async (key: string, expiryTime: number) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiryTime,
      ResponseContentDisposition: `attachment; filename="${key}"`,
    };

    console.log(params)
    return await s3.getSignedUrlPromise('getObject', params); 
  } catch (error) {
    console.log("======================= ERROR ==========================");
    console.log(error);
    console.log("========================<><><>==========================");
  }
};


export const deleteObjectFromS3 = async (name: string) => {
  s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: name
    },(err, data) => {
          if (err) {
              console.error("Error deleting object:", err);
          } else {
              console.log("Object deleted successfully:", data);
          }
    });

    return;
}