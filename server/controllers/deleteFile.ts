import cron from 'node-cron'
import UploadModel from '../models/Upload';
import dotenv from 'dotenv';
dotenv.config();

import {deleteObjectFromS3} from '../services/awsS3';


function hasExpired(createdAt: Date, expiryTime: number) {
    const currentTime = new Date();
    const expiryDate = new Date(createdAt);

    let expiryTimeMins = 0;
    let expiryTimeHours = 0;
        expiryTimeMins = (expiryTime % 3600)/60;
        expiryTimeHours = expiryTime / 3600;

    expiryDate.setHours(expiryDate.getHours() + expiryTimeHours);
    expiryDate.setMinutes(expiryDate.getMinutes()+ expiryTimeMins);

    return currentTime > expiryDate;
}

export default async function deleteExpiredObjects() {
    try {
        const allObjects = await UploadModel.find({}); 

        for (let obj of allObjects) {
            const { name, expiryTime, createdAt, files } = obj;

            if ( expiryTime != 0 && hasExpired(createdAt, expiryTime)) {
                
                for (let file of files) {
                    await deleteObjectFromS3(file.name);
                    console.log(`Deleted S3 object: ${file.name}`);
                }
                
                await UploadModel.deleteOne({ name });
                console.log(`Deleted S3 object: ${name}`);
            }
        }
    } catch (error) {
        console.log("======================= ERROR ==========================");
        console.error('Error deleting S3 object:', error);
        console.log("========================<><><>==========================")
    }
}

