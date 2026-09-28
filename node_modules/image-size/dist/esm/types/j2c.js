import { readUInt32BE } from './utils.js';
export const J2C = {
    validate: (input) => readUInt32BE(input, 0) === 0xff4fff51,
    calculate: (input) => ({
        height: readUInt32BE(input, 12),
        width: readUInt32BE(input, 8),
    }),
};
