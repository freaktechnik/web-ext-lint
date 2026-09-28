"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableTypes = void 0;
exports.imageSize = imageSize;
const detector_1 = require("./detector");
const index_1 = require("./types/index");
const globalOptions = {
    disabledTypes: [],
};
function imageSize(input) {
    const type = (0, detector_1.detector)(input);
    if (typeof type !== 'undefined') {
        if (globalOptions.disabledTypes.indexOf(type) > -1) {
            throw new TypeError(`disabled file type: ${type}`);
        }
        const size = index_1.typeHandlers.get(type)?.calculate(input);
        if (size !== undefined) {
            size.type = size.type ?? type;
            if (size.images && size.images.length > 1) {
                const largestImage = size.images.reduce((largest, current) => {
                    return current.width * current.height > largest.width * largest.height
                        ? current
                        : largest;
                }, size.images[0]);
                size.width = largestImage.width;
                size.height = largestImage.height;
            }
            return size;
        }
    }
    throw new TypeError(`unsupported file type: ${type}`);
}
const disableTypes = (types) => {
    globalOptions.disabledTypes = types;
};
exports.disableTypes = disableTypes;
