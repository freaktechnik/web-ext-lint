import * as fs from 'node:fs';
import * as path from 'node:path';
import { imageSize } from './lookup.js';
const MaxInputSize = 512 * 1024;
const queue = [];
let concurrency = 100;
export const setConcurrency = (c) => {
    concurrency = c;
};
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
            resolve(imageSize(input));
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
export const imageSizeFromFile = async (filePath) => new Promise((resolve, reject) => {
    queue.push({ filePath, resolve, reject });
    processQueue();
});
