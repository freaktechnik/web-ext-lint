"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JPG = void 0;
const utils_1 = require("./utils");
const EXIF_MARKER = '45786966';
const APP1_DATA_SIZE_BYTES = 2;
const EXIF_HEADER_BYTES = 6;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = '4d4d';
const LITTLE_ENDIAN_BYTE_ALIGN = '4949';
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;
function isEXIF(input) {
    return (0, utils_1.toHexString)(input, 2, 6) === EXIF_MARKER;
}
function extractSize(input, index) {
    return {
        height: (0, utils_1.readUInt16BE)(input, index),
        width: (0, utils_1.readUInt16BE)(input, index + 2),
    };
}
function extractOrientation(exifBlock, isBigEndian) {
    const idfOffset = 8;
    const offset = EXIF_HEADER_BYTES + idfOffset;
    const idfDirectoryEntries = (0, utils_1.readUInt)(exifBlock, 16, offset, isBigEndian);
    for (let directoryEntryNumber = 0; directoryEntryNumber < idfDirectoryEntries; directoryEntryNumber++) {
        const start = offset +
            NUM_DIRECTORY_ENTRIES_BYTES +
            directoryEntryNumber * IDF_ENTRY_BYTES;
        const end = start + IDF_ENTRY_BYTES;
        if (start > exifBlock.length) {
            return;
        }
        const block = exifBlock.slice(start, end);
        const tagNumber = (0, utils_1.readUInt)(block, 16, 0, isBigEndian);
        if (tagNumber === 274) {
            const dataFormat = (0, utils_1.readUInt)(block, 16, 2, isBigEndian);
            if (dataFormat !== 3) {
                return;
            }
            const numberOfComponents = (0, utils_1.readUInt)(block, 32, 4, isBigEndian);
            if (numberOfComponents !== 1) {
                return;
            }
            return (0, utils_1.readUInt)(block, 16, 8, isBigEndian);
        }
    }
}
function validateExifBlock(input, index) {
    const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index);
    const byteAlign = (0, utils_1.toHexString)(exifBlock, EXIF_HEADER_BYTES, EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES);
    const isBigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
    const isLittleEndian = byteAlign === LITTLE_ENDIAN_BYTE_ALIGN;
    if (isBigEndian || isLittleEndian) {
        return extractOrientation(exifBlock, isBigEndian);
    }
}
function validateInput(input, index) {
    if (index > input.length) {
        throw new TypeError('Corrupt JPG, exceeded buffer limits');
    }
}
exports.JPG = {
    validate: (input) => (0, utils_1.toHexString)(input, 0, 2) === 'ffd8',
    calculate(_input) {
        let input = _input.slice(4);
        let orientation;
        let next;
        while (input.length) {
            const i = (0, utils_1.readUInt16BE)(input, 0);
            validateInput(input, i);
            if (input[i] !== 0xff) {
                input = input.slice(1);
                continue;
            }
            if (isEXIF(input)) {
                orientation = validateExifBlock(input, i);
            }
            next = input[i + 1];
            if (next === 0xc0 || next === 0xc1 || next === 0xc2) {
                const size = extractSize(input, i + 5);
                if (!orientation) {
                    return size;
                }
                return {
                    height: size.height,
                    orientation,
                    width: size.width,
                };
            }
            input = input.slice(i + 2);
        }
        throw new TypeError('Invalid JPG, no size found');
    },
};
