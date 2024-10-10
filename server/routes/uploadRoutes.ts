import { Router } from 'express';
import { uploadFiles, getUploadedFiles } from '../controllers/uploadFiles';

const router = Router();

router.post('/upload', uploadFiles);
router.post('/getObject', getUploadedFiles);

export default router;
