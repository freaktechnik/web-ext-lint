export declare class BitReader {
    private readonly input;
    private readonly endianness;
    private byteOffset;
    private bitOffset;
    constructor(input: Uint8Array, endianness: 'big-endian' | 'little-endian');
    getBits(length?: number): number;
}
