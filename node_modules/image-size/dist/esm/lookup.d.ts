import type { imageType } from './types/index.js';
import type { ISizeCalculationResult } from './types/interface.js';
export declare function imageSize(input: Uint8Array): ISizeCalculationResult;
export declare const disableTypes: (types: imageType[]) => void;
