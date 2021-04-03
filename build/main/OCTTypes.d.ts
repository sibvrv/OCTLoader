export interface ITexture {
    width: number;
    height: number;
    setshader: string;
    specscale: [number, number, number];
    envscale: [number, number, number];
    texrotate: number;
    texscale: number;
    diffuse: string;
    normal: string;
    spec: string;
    glow: string;
}
export interface ITextureInfo {
    path: string;
    tex: ITexture;
}
export interface IOCTSettings {
    textures: ITextureInfo[];
}
export declare const VSLOT_SHPARAM = 0, VSLOT_SCALE = 1, VSLOT_ROTATION = 2, VSLOT_OFFSET = 3, VSLOT_SCROLL = 4, VSLOT_LAYER = 5, VSLOT_ALPHA = 6, VSLOT_COLOR = 7, VSLOT_RESERVED = 8, // used by RE
VSLOT_REFRACT = 9, VSLOT_DETAIL = 10, VSLOT_NUM = 11;
export declare const OCTSAV_CHILDREN = 0, OCTSAV_EMPTY = 1, OCTSAV_SOLID = 2, OCTSAV_NORMAL = 3;
export declare const LAYER_TOP: number;
export declare const LAYER_BOTTOM: number;
export declare const LAYER_BLEND: number;
export declare const MAXFACEVERTS = 15;
export declare const INT_MAX = 2147483647;
export declare const MATF_INDEX_SHIFT = 0, MATF_VOLUME_SHIFT = 2, MATF_CLIP_SHIFT = 5, MATF_FLAG_SHIFT = 8, MATF_INDEX: number, MATF_VOLUME: number, MATF_CLIP: number, MATF_FLAGS: number;
export declare const // cube empty-space materials
MAT_AIR = 0, // the default, fill the empty space with air
MAT_WATER: number, // fill with water, showing waves at the surface
MAT_LAVA: number, // fill with lava
MAT_GLASS: number, // behaves like clip but is blended blueish
MAT_NOCLIP: number, // collisions always treat cube as empty
MAT_CLIP: number, // collisions always treat cube as solid
MAT_GAMECLIP: number, // game specific clip material
MAT_DEATH: number, // force player suicide
MAT_NOGI: number, // disable global illumination
MAT_LADDER: number, // acts as ladder (move up/down)
MAT_ALPHA: number;
export declare const F_EMPTY = 0;
export declare const F_SOLID = 2155905152;
export declare const LAYER_DUP: number;
export declare function isliquid(mat: any): boolean;
export declare function isclipped(mat: any): boolean;
export declare function isdeadly(mat: any): boolean;
export declare function isladder(mat: any): boolean;
export declare const faceedgesidx: number[][];
export declare const notouchmasks: number[][];
export declare const triverts: number[][][][];
export interface IEntity {
    x: number;
    y: number;
    z: number;
    attr1: number;
    attr2: number;
    attr3: number;
    attr4: number;
    attr5: number;
    type: number;
    reserved: number;
}
export interface IEntityV2 {
    params: number;
    x: number;
    y: number;
    z: number;
    attr1: number;
    attr2: number;
    attr3: number;
    attr4: number;
    attr5: number;
    type: number;
    reserved: number;
    name: string;
}
export interface ISurfaceInfo {
    verts: number;
    numverts: number;
}
export interface IVars {
    name: string;
    value: string;
}
export interface IOCTHeader {
    magic: string;
    version: number;
    headersize: number;
    worldsize: number;
    numents: number;
    numpvs: number;
    lightmaps?: number;
    blendmap: number;
    numvars: number;
    numvslots: number;
}
