"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEIF = void 0;
const utils_1 = require("./utils");
const brandMap = {
    avif: 'avif',
    mif1: 'heif',
    msf1: 'heif',
    heic: 'heic',
    heix: 'heic',
    hevc: 'heic',
    hevx: 'heic',
};
exports.HEIF = {
    validate(input) {
        const boxType = (0, utils_1.toUTF8String)(input, 4, 8);
        if (boxType !== 'ftyp')
            return false;
        const ftypBox = (0, utils_1.findBox)(input, 'ftyp', 0);
        if (!ftypBox)
            return false;
        const brand = (0, utils_1.toUTF8String)(input, ftypBox.offset + 8, ftypBox.offset + 12);
        return brand in brandMap;
    },
    calculate(input) {
        const metaBox = (0, utils_1.findBox)(input, 'meta', 0);
        const iprpBox = metaBox && (0, utils_1.findBox)(input, 'iprp', metaBox.offset + 12);
        const ipcoBox = iprpBox && (0, utils_1.findBox)(input, 'ipco', iprpBox.offset + 8);
        if (!ipcoBox) {
            throw new TypeError('Invalid HEIF, no ipco box found');
        }
        const type = (0, utils_1.toUTF8String)(input, 8, 12);
        const images = [];
        let currentOffset = ipcoBox.offset + 8;
        while (currentOffset < ipcoBox.offset + ipcoBox.size) {
            const ispeBox = (0, utils_1.findBox)(input, 'ispe', currentOffset);
            if (!ispeBox)
                break;
            if (ispeBox.size < 20) {
                throw new TypeError('Invalid HEIF');
            }
            const rawWidth = (0, utils_1.readUInt32BE)(input, ispeBox.offset + 12);
            const rawHeight = (0, utils_1.readUInt32BE)(input, ispeBox.offset + 16);
            const clapBox = (0, utils_1.findBox)(input, 'clap', currentOffset);
            let width = rawWidth;
            const height = rawHeight;
            if (clapBox &&
                clapBox.size >= 16 &&
                clapBox.offset < ipcoBox.offset + ipcoBox.size) {
                const cropRight = (0, utils_1.readUInt32BE)(input, clapBox.offset + 12);
                width = rawWidth - cropRight;
            }
            images.push({ height, width });
            const nextOffset = ispeBox.offset + ispeBox.size;
            if (nextOffset <= currentOffset) {
                throw new TypeError('Invalid HEIF');
            }
            currentOffset = nextOffset;
        }
        if (images.length === 0) {
            throw new TypeError('Invalid HEIF, no sizes found');
        }
        return {
            width: images[0].width,
            height: images[0].height,
            type,
            ...(images.length > 1 ? { images } : {}),
        };
    },
};
