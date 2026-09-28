import { detector } from './detector.js';
import { typeHandlers } from './types/index.js';
const globalOptions = {
    disabledTypes: [],
};
export function imageSize(input) {
    const type = detector(input);
    if (typeof type !== 'undefined') {
        if (globalOptions.disabledTypes.indexOf(type) > -1) {
            throw new TypeError(`disabled file type: ${type}`);
        }
        const size = typeHandlers.get(type)?.calculate(input);
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
export const disableTypes = (types) => {
    globalOptions.disabledTypes = types;
};
