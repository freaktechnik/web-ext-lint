"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICNS = void 0;
const utils_1 = require("./utils");
const SIZE_HEADER = 4 + 4;
const FILE_LENGTH_OFFSET = 4;
const ENTRY_LENGTH_OFFSET = 4;
const ICON_TYPE_SIZE = {
    ICON: 32,
    'ICN#': 32,
    'icm#': 16,
    icm4: 16,
    icm8: 16,
    'ics#': 16,
    ics4: 16,
    ics8: 16,
    is32: 16,
    s8mk: 16,
    icp4: 16,
    icl4: 32,
    icl8: 32,
    il32: 32,
    l8mk: 32,
    icp5: 32,
    ic11: 32,
    ich4: 48,
    ich8: 48,
    ih32: 48,
    h8mk: 48,
    icp6: 64,
    ic12: 32,
    it32: 128,
    t8mk: 128,
    ic07: 128,
    ic08: 256,
    ic13: 256,
    ic09: 512,
    ic14: 512,
    ic10: 1024,
};
function readImageHeader(input, imageOffset) {
    const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET;
    if (imageLengthOffset + 4 > input.length) {
        throw new TypeError('Invalid ICNS');
    }
    return [
        (0, utils_1.toUTF8String)(input, imageOffset, imageLengthOffset),
        (0, utils_1.readUInt32BE)(input, imageLengthOffset),
    ];
}
function getImageSize(type) {
    const size = ICON_TYPE_SIZE[type];
    return { width: size, height: size, type };
}
exports.ICNS = {
    validate: (input) => (0, utils_1.toUTF8String)(input, 0, 4) === 'icns',
    calculate(input) {
        const inputLength = input.length;
        const fileLength = (0, utils_1.readUInt32BE)(input, FILE_LENGTH_OFFSET);
        let imageOffset = SIZE_HEADER;
        const images = [];
        while (imageOffset < fileLength && imageOffset < inputLength) {
            const imageHeader = readImageHeader(input, imageOffset);
            const entryLength = imageHeader[1];
            if (entryLength < 8) {
                throw new TypeError('Invalid ICNS');
            }
            const imageSize = getImageSize(imageHeader[0]);
            images.push(imageSize);
            imageOffset += entryLength;
        }
        if (images.length === 0) {
            throw new TypeError('Invalid ICNS, no sizes found');
        }
        return {
            width: images[0].width,
            height: images[0].height,
            ...(images.length > 1 ? { images } : {}),
        };
    },
};
