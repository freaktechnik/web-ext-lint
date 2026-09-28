import type { ISizeCalculationResult } from './types/interface';
export declare const setConcurrency: (c: number) => void;
export declare const imageSizeFromFile: (filePath: string) => Promise<ISizeCalculationResult>;
