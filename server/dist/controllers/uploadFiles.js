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
exports.getUploadedFiles = exports.uploadFiles = void 0;
const Upload_1 = __importDefault(require("../models/Upload"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const awsS3_1 = require("../services/awsS3");
const uploadFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        let { text, password, name, expiryTime } = req.body;
        if (!((_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a.files) && (!text || text === "")) {
            return res.status(400).json({ success: false, message: 'No files and text uploaded' });
        }
        let hasPassword = true;
        if (password == "" || password == undefined || password == null) {
            hasPassword = false;
        }
        const isNameExist = yield Upload_1.default.findOne({ name });
        if (isNameExist) {
            return res.status(400).json({ success: false, message: 'Name already exist' });
        }
        let filesArray;
        let uploadedFiles;
        if (((_b = req.files) === null || _b === void 0 ? void 0 : _b.files) !== undefined) {
            filesArray = Array.isArray((_c = req.files) === null || _c === void 0 ? void 0 : _c.files) ? (_d = req.files) === null || _d === void 0 ? void 0 : _d.files : [(_e = req.files) === null || _e === void 0 ? void 0 : _e.files];
            if (filesArray.length !== 0) {
                uploadedFiles = yield Promise.all(filesArray.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                    const s3Data = yield (0, awsS3_1.uploadFileToS3)(file);
                    return {
                        link: s3Data.Location,
                        type: file === null || file === void 0 ? void 0 : file.mimetype,
                        name: file === null || file === void 0 ? void 0 : file.name,
                        expiryTime: expiryTime
                    };
                })));
            }
        }
        const hashedPassword = hasPassword && password ? yield bcryptjs_1.default.hash(password, 10) : undefined;
        const newUpload = new Upload_1.default({
            files: uploadedFiles,
            text,
            hasPassword,
            password: hashedPassword,
            name,
            expiryTime: expiryTime
        });
        yield newUpload.save();
        return res.status(201).json({ success: true, message: 'Files uploaded successfully', data: newUpload });
    }
    catch (error) {
        console.log("======================= ERROR ==========================");
        console.log(error);
        console.log("========================<><><>==========================");
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.uploadFiles = uploadFiles;
const getUploadedFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password } = req.body;
        const uploads = yield Upload_1.default.findOne({ name });
        if (!uploads) {
            return res.status(404).json({ success: false, message: 'No files found' });
        }
        if (uploads.hasPassword) {
            if (password === undefined || password === null || password === "" || uploads.password === undefined || uploads.password === null) {
                return res.status(401).json({ success: false, message: 'Password required' });
            }
            const isMatch = yield bcryptjs_1.default.compare(password, uploads.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }
        }
        return res.status(200).json({ success: true, data: uploads });
    }
    catch (error) {
        console.log("======================= ERROR ==========================");
        console.log(error);
        console.log("========================<><><>==========================");
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.getUploadedFiles = getUploadedFiles;
