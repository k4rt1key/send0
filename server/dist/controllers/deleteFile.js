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
exports.default = deleteExpiredObjects;
const Upload_1 = __importDefault(require("../models/Upload"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const awsS3_1 = require("../services/awsS3");
function hasExpired(createdAt, expiryTime) {
    const currentTime = new Date();
    const expiryDate = new Date(createdAt);
    expiryDate.setHours(expiryDate.getHours() + expiryTime);
    return currentTime > expiryDate;
}
function deleteExpiredObjects() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allObjects = yield Upload_1.default.find({});
            for (let obj of allObjects) {
                const { name, expiryTime, createdAt } = obj;
                if (hasExpired(createdAt, expiryTime)) {
                    yield Upload_1.default.deleteOne({ name });
                    yield (0, awsS3_1.deleteObjectFromS3)(name);
                    console.log(`Deleted S3 object: ${name}`);
                }
            }
        }
        catch (error) {
            console.log("======================= ERROR ==========================");
            console.error('Error deleting S3 object:', error);
            console.log("========================<><><>==========================");
        }
    });
}
