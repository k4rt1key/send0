"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteObjectFromS3 = exports.generatePresignedUrlForGetObject = exports.uploadFileToS3 = exports.s3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
const bucketName = process.env.AWS_S3_BUCKET_NAME;
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const uploadFileToS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = {
            Bucket: bucketName,
            Key: `${file.name}`,
            Body: file.data,
            ContentType: file.mimetype,
        };
        return yield exports.s3.upload(params).promise();
    }
    catch (error) {
        console.log("======================= ERROR ==========================");
        console.log(error);
        console.log("========================<><><>==========================");
    }
});
exports.uploadFileToS3 = uploadFileToS3;
const generatePresignedUrlForGetObject = (key, expiryTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = {
            Bucket: bucketName,
            Key: key,
            Expires: 3600 * expiryTime,
            ResponseContentDisposition: `attachment; filename="${key}"`,
        };
        return yield exports.s3.getSignedUrlPromise('getObject', params);
    }
    catch (error) {
        console.log("======================= ERROR ==========================");
        console.log(error);
        console.log("========================<><><>==========================");
    }
});
exports.generatePresignedUrlForGetObject = generatePresignedUrlForGetObject;
const deleteObjectFromS3 = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return exports.s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: name
    });
});
exports.deleteObjectFromS3 = deleteObjectFromS3;
