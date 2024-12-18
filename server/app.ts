import express from 'express';
import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import cron from 'node-cron';
import deleteExpiredObjects from './controllers/deleteFile';
import cors from 'cors';



dotenv.config();

const app = express();

app.use(cors({
    origin: ['send0.vercel.app', 'localhost:5173']
}));

app.use(fileUpload());

app.use(express.json());

// Routes
app.use('/api/v1', uploadRoutes);


cron.schedule('*/1 * * * *', () => {
    console.log('Running scheduled task to delete expired S3 objects...');
    deleteExpiredObjects();
});


const PORT = process.env.PORT || 5000;
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "").then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})
.catch(err => console.log(err));

