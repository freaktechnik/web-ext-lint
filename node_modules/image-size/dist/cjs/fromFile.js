"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageSizeFromFile = exports.setConcurrency = void 0;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const lookup_1 = require("./lookup");
const MaxInputSize = 512 * 1024;
const queue = [];
let concurrency = 100;
const setConcurrency = (c) => {
    concurrency = c;
};
exports.setConcurrency = setConcurrency;
const processQueue = async () => {
    const jobs = queue.splice(0, concurrency);
    const promises = jobs.map(async ({ filePath, resolve, reject }) => {
        let handle;
        try {
            handle = await fs.promises.open(path.resolve(filePath), 'r');
        }
        catch (err) {
            return reject(err);
        }
        try {
            const { size } = await handle.stat();
            if (size <= 0) {
                throw new Error('Empty file');
            }
            const inputSize = Math.min(size, MaxInputSize);
            const input = new Uint8Array(inputSize);
            await handle.read(input, 0, inputSize, 0);
            resolve((0, lookup_1.imageSize)(input));
        }
        catch (err) {
            reject(err);
        }
        finally {
            await handle.close();
        }
    });
    await Promise.allSettled(promises);
    if (queue.length)
        setTimeout(processQueue, 100);
};
const imageSizeFromFile = async (filePath) => new Promise((resolve, reject) => {
    queue.push({ filePath, resolve, reject });
    processQueue();
});
exports.imageSizeFromFile = imageSizeFromFile;
