import cron from 'node-cron'
import UploadModel from '../models/Upload';
import dotenv from 'dotenv';
dotenv.config();

import {deleteObjectFromS3} from '../services/awsS3';


function hasExpired(createdAt: Date, expiryTime: number) {
    const currentTime = new Date();
    const expiryDate = new Date(createdAt);
    expiryDate.setHours(expiryDate.getHours() + expiryTime);

    return currentTime > expiryDate;
}

export default async function deleteExpiredObjects() {
    try {
        const allObjects = await UploadModel.find({}); 

        for (let obj of allObjects) {
            const { name, expiryTime, createdAt, files } = obj;

            if (hasExpired(createdAt, expiryTime)) {
                
                await UploadModel.deleteOne({ name });
                for (let file of files) {
                    await deleteObjectFromS3(file.name);
                    console.log(`Deleted S3 object: ${file.name}`);
                }
                console.log(`Deleted S3 object: ${name}`);
            }
        }
    } catch (error) {
        console.log("======================= ERROR ==========================");
        console.error('Error deleting S3 object:', error);
        console.log("========================<><><>==========================")
    }
}

