"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadFiles_1 = require("../controllers/uploadFiles");
const router = (0, express_1.Router)();
router.post('/upload', uploadFiles_1.uploadFiles);
router.post('/getObject', uploadFiles_1.getUploadedFiles);
exports.default = router;
