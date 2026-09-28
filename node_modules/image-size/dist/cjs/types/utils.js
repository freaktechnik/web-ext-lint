"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUInt64 = exports.readUInt32LE = exports.readUInt32BE = exports.readInt32LE = exports.readUInt24LE = exports.readUInt16LE = exports.readUInt16BE = exports.readInt16LE = exports.toHexString = exports.toUTF8String = void 0;
exports.readUInt = readUInt;
exports.findBox = findBox;
const decoder = new TextDecoder();
const toUTF8String = (input, start = 0, end = input.length) => decoder.decode(input.slice(start, end));
exports.toUTF8String = toUTF8String;
const toHexString = (input, start = 0, end = input.length) => input
    .slice(start, end)
    .reduce((memo, i) => memo + `0${i.toString(16)}`.slice(-2), '');
exports.toHexString = toHexString;
const getView = (input, offset) => new DataView(input.buffer, input.byteOffset + offset);
const readInt16LE = (input, offset = 0) => getView(input, offset).getInt16(0, true);
exports.readInt16LE = readInt16LE;
const readUInt16BE = (input, offset = 0) => getView(input, offset).getUint16(0, false);
exports.readUInt16BE = readUInt16BE;
const readUInt16LE = (input, offset = 0) => getView(input, offset).getUint16(0, true);
exports.readUInt16LE = readUInt16LE;
const readUInt24LE = (input, offset = 0) => {
    const view = getView(input, offset);
    return view.getUint16(0, true) + (view.getUint8(2) << 16);
};
exports.readUInt24LE = readUInt24LE;
const readInt32LE = (input, offset = 0) => getView(input, offset).getInt32(0, true);
exports.readInt32LE = readInt32LE;
const readUInt32BE = (input, offset = 0) => getView(input, offset).getUint32(0, false);
exports.readUInt32BE = readUInt32BE;
const readUInt32LE = (input, offset = 0) => getView(input, offset).getUint32(0, true);
exports.readUInt32LE = readUInt32LE;
const readUInt64 = (input, offset, isBigEndian) => getView(input, offset).getBigUint64(0, !isBigEndian);
exports.readUInt64 = readUInt64;
const methods = {
    readUInt16BE: exports.readUInt16BE,
    readUInt16LE: exports.readUInt16LE,
    readUInt32BE: exports.readUInt32BE,
    readUInt32LE: exports.readUInt32LE,
};
function readUInt(input, bits, offset = 0, isBigEndian = false) {
    const endian = isBigEndian ? 'BE' : 'LE';
    const methodName = `readUInt${bits}${endian}`;
    return methods[methodName](input, offset);
}
const BOX_HEADER_SIZE = 8;
function readBox(input, offset) {
    if (input.length - offset < BOX_HEADER_SIZE)
        return undefined;
    const boxSize = (0, exports.readUInt32BE)(input, offset);
    if (input.length - offset < boxSize)
        return undefined;
    return {
        name: (0, exports.toUTF8String)(input, 4 + offset, 8 + offset),
        offset,
        size: boxSize,
    };
}
function findBox(input, boxName, startOffset) {
    let currentOffset = startOffset;
    while (currentOffset < input.length) {
        if (input.length - currentOffset < 4)
            break;
        const boxSize = (0, exports.readUInt32BE)(input, currentOffset);
        if (boxSize < BOX_HEADER_SIZE) {
            currentOffset += BOX_HEADER_SIZE;
            continue;
        }
        const box = readBox(input, currentOffset);
        if (!box)
            break;
        if (box.name === boxName)
            return box;
        currentOffset += box.size;
    }
    return undefined;
}
