"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const node_cron_1 = __importDefault(require("node-cron"));
const deleteFile_1 = __importDefault(require("./controllers/deleteFile"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, express_fileupload_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/v1', uploadRoutes_1.default);
node_cron_1.default.schedule('*/10 * * * *', () => {
    console.log('Running scheduled task to delete expired S3 objects...');
    (0, deleteFile_1.default)();
});
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGO_URI || "").then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
    .catch(err => console.log(err));
