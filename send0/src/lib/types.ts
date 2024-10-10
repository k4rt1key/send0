export interface UploadData {
    files: FileSchema[];
    text: string;
    hasPassword: boolean,
    password: string;
    name: string;
    expiryTime: number;
  }
  
  export interface UploadInputData {
    files: File[];
    text: string;
    password: string;
    name: string;
    hasPassword: boolean;
    expiryTime: number;
  }
  
  export interface FileSchema {
    link: string;
    type: string;
    name: string;
    presignedUrl ?: string;
    expiryTime ?: number;
  }

  export interface ServerResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: UploadData | [];
  }