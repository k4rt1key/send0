import mongoose, { Schema, Document } from 'mongoose';
import { generatePresignedUrlForGetObject } from '../services/awsS3';

interface FileSchema {
  link: string;
  type: string;
  name: string;
  presignedUrl: string;
  isDeleteAfterView: boolean;
  expiryTime: number;
}

export interface UploadDocument extends Document {
  files: FileSchema[];
  text: string;
  hasPassword: boolean;
  password?: string;
  name: string;
  expiryTime: number;
  isDeleteAfterView: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<FileSchema>({
  link: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  presignedUrl: { type: String},
  expiryTime: { type: Number, required: true }
});

const UploadSchema = new Schema<UploadDocument>({
  files: { type: [FileSchema], required: true },
  text: { type: String, required: true },
  hasPassword: { type: Boolean, required: true },
  password: { type: String },
  name: { type: String, required: true, unique: true },
  expiryTime: { type: Number, required: true },
  isDeleteAfterView: {type: Boolean, default: false}
},{timestamps:true});

UploadSchema.pre('save', async function(next) {
  if(!this.isNew) {
    return next();
  }

  else {
    if(this.files.length !== 0){
      for (let i = 0; i < this.files.length; i++) {
        const presignedUrl = await generatePresignedUrlForGetObject(this.files[i].name , this.expiryTime) || '';
        this.files[i].presignedUrl = presignedUrl;
      }
      next();
    } 
  }
});

const UploadModel = mongoose.model<UploadDocument>('Upload', UploadSchema);
export default UploadModel
