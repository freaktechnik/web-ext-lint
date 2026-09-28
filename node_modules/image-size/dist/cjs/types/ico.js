"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICO = void 0;
const utils_1 = require("./utils");
const TYPE_ICON = 1;
const SIZE_HEADER = 2 + 2 + 2;
const SIZE_IMAGE_ENTRY = 1 + 1 + 1 + 1 + 2 + 2 + 4 + 4;
function getSizeFromOffset(input, offset) {
    const value = input[offset];
    return value === 0 ? 256 : value;
}
function getImageSize(input, imageIndex) {
    const offset = SIZE_HEADER + imageIndex * SIZE_IMAGE_ENTRY;
    return {
        height: getSizeFromOffset(input, offset + 1),
        width: getSizeFromOffset(input, offset),
    };
}
exports.ICO = {
    validate(input) {
        const reserved = (0, utils_1.readUInt16LE)(input, 0);
        const imageCount = (0, utils_1.readUInt16LE)(input, 4);
        if (reserved !== 0 || imageCount === 0)
            return false;
        const imageType = (0, utils_1.readUInt16LE)(input, 2);
        return imageType === TYPE_ICON;
    },
    calculate(input) {
        const nbImages = (0, utils_1.readUInt16LE)(input, 4);
        if (SIZE_HEADER + nbImages * SIZE_IMAGE_ENTRY > input.length) {
            throw new TypeError('Invalid ICO');
        }
        const imageSize = getImageSize(input, 0);
        if (nbImages === 1)
            return imageSize;
        const images = [];
        for (let imageIndex = 0; imageIndex < nbImages; imageIndex += 1) {
            images.push(getImageSize(input, imageIndex));
        }
        return {
            width: imageSize.width,
            height: imageSize.height,
            images: images,
        };
    },
};
