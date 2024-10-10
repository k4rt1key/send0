import { Request, Response } from 'express';
import UploadModel from '../models/Upload';
import bcrypt from 'bcryptjs';
import { uploadFileToS3, generatePresignedUrlForGetObject } from '../services/awsS3';

export const uploadFiles = async (req: Request, res: Response): Promise<any> => {
  try {

    let { text, password, name, expiryTime } = req.body;

    if (!req?.files?.files && (!text || text === "")) {
      return res.status(400).json({ success: false, message: 'No files and text uploaded' });
    }

    let hasPassword = true
    if(password == "" || password == undefined || password == null) {
      hasPassword = false;
    }

    const isNameExist = await UploadModel.findOne({name});
    if(isNameExist) {
      return res.status(400).json({ success: false, message: 'Name already exist' });
    }

    let filesArray;
    let uploadedFiles;
    if(req.files?.files !== undefined){
      filesArray = Array.isArray(req.files?.files) ? req.files?.files : [req.files?.files];
      
      if(filesArray.length !== 0){

          uploadedFiles = await Promise.all(filesArray.map(async (file) => {          

          const s3Data = await uploadFileToS3(file);
          return {
            link: (s3Data as any).Location,
            type: file?.mimetype,
            name: file?.name,
            expiryTime: expiryTime
          };
        }));
      }
    }

    const hashedPassword = hasPassword && password ? await bcrypt.hash(password, 10) : undefined;

    const newUpload = new UploadModel({
      files: uploadedFiles,
      text,
      hasPassword,
      password: hashedPassword,
      name,
      expiryTime: expiryTime
    });

    await newUpload.save();

    return res.status(201).json({ success: true, message: 'Files uploaded successfully', data: newUpload });
  } catch (error) {
    console.log("======================= ERROR ==========================");
    console.log(error);
    console.log("========================<><><>==========================");
    return res.status(500).json({ success: false, message: 'Server error'});
  }
};

export const getUploadedFiles = async (req: Request, res: Response): Promise<any> => {
  try {

    const { name, password } = req.body;

    const uploads = await UploadModel.findOne({name});

    if (!uploads) {
      return res.status(404).json({ success: false, message: 'No files found' });
    }

    if(uploads.hasPassword) {
      if(password === undefined || password === null || password === "" || uploads.password === undefined || uploads.password === null) {
        return res.status(401).json({ success: false, message: 'Password required' });
      }
      const isMatch = await bcrypt.compare(password, uploads.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }
    }

    return res.status(200).json({ success: true, data: uploads})
  } catch (error) {
    console.log("======================= ERROR ==========================");
    console.log(error);
    console.log("========================<><><>==========================");
    return res.status(500).json({ success: false, message: 'Server error'});
  }
}
