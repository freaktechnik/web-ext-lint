const decoder = new TextDecoder();
export const toUTF8String = (input, start = 0, end = input.length) => decoder.decode(input.slice(start, end));
export const toHexString = (input, start = 0, end = input.length) => input
    .slice(start, end)
    .reduce((memo, i) => memo + `0${i.toString(16)}`.slice(-2), '');
const getView = (input, offset) => new DataView(input.buffer, input.byteOffset + offset);
export const readInt16LE = (input, offset = 0) => getView(input, offset).getInt16(0, true);
export const readUInt16BE = (input, offset = 0) => getView(input, offset).getUint16(0, false);
export const readUInt16LE = (input, offset = 0) => getView(input, offset).getUint16(0, true);
export const readUInt24LE = (input, offset = 0) => {
    const view = getView(input, offset);
    return view.getUint16(0, true) + (view.getUint8(2) << 16);
};
export const readInt32LE = (input, offset = 0) => getView(input, offset).getInt32(0, true);
export const readUInt32BE = (input, offset = 0) => getView(input, offset).getUint32(0, false);
export const readUInt32LE = (input, offset = 0) => getView(input, offset).getUint32(0, true);
export const readUInt64 = (input, offset, isBigEndian) => getView(input, offset).getBigUint64(0, !isBigEndian);
const methods = {
    readUInt16BE,
    readUInt16LE,
    readUInt32BE,
    readUInt32LE,
};
export function readUInt(input, bits, offset = 0, isBigEndian = false) {
    const endian = isBigEndian ? 'BE' : 'LE';
    const methodName = `readUInt${bits}${endian}`;
    return methods[methodName](input, offset);
}
const BOX_HEADER_SIZE = 8;
function readBox(input, offset) {
    if (input.length - offset < BOX_HEADER_SIZE)
        return undefined;
    const boxSize = readUInt32BE(input, offset);
    if (input.length - offset < boxSize)
        return undefined;
    return {
        name: toUTF8String(input, 4 + offset, 8 + offset),
        offset,
        size: boxSize,
    };
}
export function findBox(input, boxName, startOffset) {
    let currentOffset = startOffset;
    while (currentOffset < input.length) {
        if (input.length - currentOffset < 4)
            break;
        const boxSize = readUInt32BE(input, currentOffset);
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
