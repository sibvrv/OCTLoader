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

export const VSLOT_SHPARAM = 0,
  VSLOT_SCALE = 1,
  VSLOT_ROTATION = 2,
  VSLOT_OFFSET = 3,
  VSLOT_SCROLL = 4,
  VSLOT_LAYER = 5,
  VSLOT_ALPHA = 6,
  VSLOT_COLOR = 7,
  VSLOT_RESERVED = 8, // used by RE
  VSLOT_REFRACT = 9,
  VSLOT_DETAIL = 10,
  VSLOT_NUM = 11;

export const OCTSAV_CHILDREN = 0,
  OCTSAV_EMPTY = 1,
  OCTSAV_SOLID = 2,
  OCTSAV_NORMAL = 3;

export const LAYER_TOP = 1 << 5;
export const LAYER_BOTTOM = 1 << 6;

export const LAYER_BLEND = LAYER_TOP | LAYER_BOTTOM;

export const MAXFACEVERTS = 15;

export const INT_MAX = 2147483647;

export const MATF_INDEX_SHIFT = 0,
  MATF_VOLUME_SHIFT = 2,
  MATF_CLIP_SHIFT = 5,
  MATF_FLAG_SHIFT = 8,
  MATF_INDEX = 3 << MATF_INDEX_SHIFT,
  MATF_VOLUME = 7 << MATF_VOLUME_SHIFT,
  MATF_CLIP = 7 << MATF_CLIP_SHIFT,
  MATF_FLAGS = 0xff << MATF_FLAG_SHIFT;

export const // cube empty-space materials
  MAT_AIR = 0, // the default, fill the empty space with air
  MAT_WATER = 1 << MATF_VOLUME_SHIFT, // fill with water, showing waves at the surface
  MAT_LAVA = 2 << MATF_VOLUME_SHIFT, // fill with lava
  MAT_GLASS = 3 << MATF_VOLUME_SHIFT, // behaves like clip but is blended blueish
  MAT_NOCLIP = 1 << MATF_CLIP_SHIFT, // collisions always treat cube as empty
  MAT_CLIP = 2 << MATF_CLIP_SHIFT, // collisions always treat cube as solid
  MAT_GAMECLIP = 3 << MATF_CLIP_SHIFT, // game specific clip material
  MAT_DEATH = 1 << MATF_FLAG_SHIFT, // force player suicide
  MAT_NOGI = 2 << MATF_FLAG_SHIFT, // disable global illumination
  MAT_LADDER = 3 << MATF_FLAG_SHIFT, // acts as ladder (move up/down)
  MAT_ALPHA = 4 << MATF_FLAG_SHIFT; // alpha blended

export const F_EMPTY = 0; // all edges in the range (0,0)
export const F_SOLID = 0x80808080; // all edges in the range (0,8)

export const LAYER_DUP = 1 << 7;

export function isliquid(mat) {
  return mat == MAT_WATER || mat == MAT_LAVA;
}

export function isclipped(mat) {
  return mat == MAT_GLASS;
}

export function isdeadly(mat) {
  return mat == MAT_LAVA;
}

export function isladder(mat) {
  return mat == MAT_LADDER;
}

export const faceedgesidx =
  // ordered edges surrounding each orient
  [
    //0..1 = row edges, 2..3 = column edges
    [4, 5, 8, 10],
    [6, 7, 9, 11],
    [8, 9, 0, 2],
    [10, 11, 1, 3],
    [0, 1, 4, 6],
    [2, 3, 5, 7],
  ];

export const notouchmasks =
  // mask of triangles not touching
  [
    // order 0: flat or convex
    // 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
    [3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 1, 3, 0],
    // order 1: concave
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 0],
  ];

export const triverts = [
  // order
  [
    // coord
    [
      [1, 2, 3],
      [0, 1, 3],
    ], // verts
    [
      [0, 1, 2],
      [0, 2, 3],
    ],
  ],
  [
    // coord
    [
      [0, 1, 2],
      [3, 0, 2],
    ], // verts
    [
      [1, 2, 3],
      [1, 3, 0],
    ],
  ],
];

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
  lightmaps?: number; // OCTA only
  blendmap: number;
  numvars: number;
  numvslots: number;
}
