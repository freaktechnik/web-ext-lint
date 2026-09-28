import type { imageType } from './types/index';
import type { ISizeCalculationResult } from './types/interface';
export declare function imageSize(input: Uint8Array): ISizeCalculationResult;
export declare const disableTypes: (types: imageType[]) => void;
