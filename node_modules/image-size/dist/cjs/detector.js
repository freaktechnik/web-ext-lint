"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detector = detector;
const index_1 = require("./types/index");
const firstBytes = new Map([
    [0x00, 'heif'],
    [0x38, 'psd'],
    [0x42, 'bmp'],
    [0x44, 'dds'],
    [0x47, 'gif'],
    [0x49, 'tiff'],
    [0x4d, 'tiff'],
    [0x52, 'webp'],
    [0x69, 'icns'],
    [0x89, 'png'],
    [0xff, 'jpg'],
]);
function detector(input) {
    const byte = input[0];
    const type = firstBytes.get(byte);
    if (type && index_1.typeHandlers.get(type)?.validate(input)) {
        return type;
    }
    return index_1.types.find((type) => index_1.typeHandlers.get(type)?.validate(input));
}
