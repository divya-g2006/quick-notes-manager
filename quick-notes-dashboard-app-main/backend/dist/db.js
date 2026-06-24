"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodbUri = process.env.MONGODB_URI;
if (!mongodbUri) {
    throw new Error("MONGODB_URI is not defined in backend/.env");
}
const globalWithMongoose = global;
let cached = globalWithMongoose.mongoose;
if (!cached) {
    cached = { conn: null, promise: null };
    globalWithMongoose.mongoose = cached;
}
async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        mongoose_1.default.set("strictQuery", true);
        cached.promise = mongoose_1.default.connect(mongodbUri).then((mongooseInstance) => mongooseInstance);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
exports.default = connectToDatabase;
