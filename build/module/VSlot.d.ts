import { ITextureInfo } from './OCTTypes';
export declare class VSlot {
    slot: number;
    index: number;
    next: VSlot;
    changed: number;
    params: any[];
    linked: boolean;
    scale: number;
    rotation: number;
    offset: number[];
    scroll: number[];
    layer: number;
    detail: number;
    alphafront: number;
    alphaback: number;
    colorscale: number[];
    glowcolor: number[];
    refractscale: number;
    refractcolor: number[];
    _tex: ITextureInfo;
    /**
     * VSlot Constructor
     */
    constructor(slot: number, index?: number);
}
