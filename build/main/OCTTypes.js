"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triverts = exports.notouchmasks = exports.faceedgesidx = exports.isladder = exports.isdeadly = exports.isclipped = exports.isliquid = exports.LAYER_DUP = exports.F_SOLID = exports.F_EMPTY = exports.MAT_ALPHA = exports.MAT_LADDER = exports.MAT_NOGI = exports.MAT_DEATH = exports.MAT_GAMECLIP = exports.MAT_CLIP = exports.MAT_NOCLIP = exports.MAT_GLASS = exports.MAT_LAVA = exports.MAT_WATER = exports.MAT_AIR = exports.MATF_FLAGS = exports.MATF_CLIP = exports.MATF_VOLUME = exports.MATF_INDEX = exports.MATF_FLAG_SHIFT = exports.MATF_CLIP_SHIFT = exports.MATF_VOLUME_SHIFT = exports.MATF_INDEX_SHIFT = exports.INT_MAX = exports.MAXFACEVERTS = exports.LAYER_BLEND = exports.LAYER_BOTTOM = exports.LAYER_TOP = exports.OCTSAV_NORMAL = exports.OCTSAV_SOLID = exports.OCTSAV_EMPTY = exports.OCTSAV_CHILDREN = exports.VSLOT_NUM = exports.VSLOT_DETAIL = exports.VSLOT_REFRACT = exports.VSLOT_RESERVED = exports.VSLOT_COLOR = exports.VSLOT_ALPHA = exports.VSLOT_LAYER = exports.VSLOT_SCROLL = exports.VSLOT_OFFSET = exports.VSLOT_ROTATION = exports.VSLOT_SCALE = exports.VSLOT_SHPARAM = void 0;
exports.VSLOT_SHPARAM = 0, exports.VSLOT_SCALE = 1, exports.VSLOT_ROTATION = 2, exports.VSLOT_OFFSET = 3, exports.VSLOT_SCROLL = 4, exports.VSLOT_LAYER = 5, exports.VSLOT_ALPHA = 6, exports.VSLOT_COLOR = 7, exports.VSLOT_RESERVED = 8, exports.VSLOT_REFRACT = 9, exports.VSLOT_DETAIL = 10, exports.VSLOT_NUM = 11;
exports.OCTSAV_CHILDREN = 0, exports.OCTSAV_EMPTY = 1, exports.OCTSAV_SOLID = 2, exports.OCTSAV_NORMAL = 3;
exports.LAYER_TOP = 1 << 5;
exports.LAYER_BOTTOM = 1 << 6;
exports.LAYER_BLEND = exports.LAYER_TOP | exports.LAYER_BOTTOM;
exports.MAXFACEVERTS = 15;
exports.INT_MAX = 2147483647;
exports.MATF_INDEX_SHIFT = 0, exports.MATF_VOLUME_SHIFT = 2, exports.MATF_CLIP_SHIFT = 5, exports.MATF_FLAG_SHIFT = 8, exports.MATF_INDEX = 3 << exports.MATF_INDEX_SHIFT, exports.MATF_VOLUME = 7 << exports.MATF_VOLUME_SHIFT, exports.MATF_CLIP = 7 << exports.MATF_CLIP_SHIFT, exports.MATF_FLAGS = 0xff << exports.MATF_FLAG_SHIFT;
exports.MAT_AIR = 0, exports.MAT_WATER = 1 << exports.MATF_VOLUME_SHIFT, exports.MAT_LAVA = 2 << exports.MATF_VOLUME_SHIFT, exports.MAT_GLASS = 3 << exports.MATF_VOLUME_SHIFT, exports.MAT_NOCLIP = 1 << exports.MATF_CLIP_SHIFT, exports.MAT_CLIP = 2 << exports.MATF_CLIP_SHIFT, exports.MAT_GAMECLIP = 3 << exports.MATF_CLIP_SHIFT, exports.MAT_DEATH = 1 << exports.MATF_FLAG_SHIFT, exports.MAT_NOGI = 2 << exports.MATF_FLAG_SHIFT, exports.MAT_LADDER = 3 << exports.MATF_FLAG_SHIFT, exports.MAT_ALPHA = 4 << exports.MATF_FLAG_SHIFT; // alpha blended
exports.F_EMPTY = 0; // all edges in the range (0,0)
exports.F_SOLID = 0x80808080; // all edges in the range (0,8)
exports.LAYER_DUP = 1 << 7;
function isliquid(mat) {
    return mat == exports.MAT_WATER || mat == exports.MAT_LAVA;
}
exports.isliquid = isliquid;
function isclipped(mat) {
    return mat == exports.MAT_GLASS;
}
exports.isclipped = isclipped;
function isdeadly(mat) {
    return mat == exports.MAT_LAVA;
}
exports.isdeadly = isdeadly;
function isladder(mat) {
    return mat == exports.MAT_LADDER;
}
exports.isladder = isladder;
exports.faceedgesidx = 
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
exports.notouchmasks = 
// mask of triangles not touching
[
    // order 0: flat or convex
    // 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
    [3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 1, 3, 0],
    // order 1: concave
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 0],
];
exports.triverts = [
    // order
    [
        // coord
        [
            [1, 2, 3],
            [0, 1, 3],
        ],
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
        ],
        [
            [1, 2, 3],
            [1, 3, 0],
        ],
    ],
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT0NUVHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT0NUVHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBMkJhLFFBQUEsYUFBYSxHQUFHLENBQUMsRUFDNUIsUUFBQSxXQUFXLEdBQUcsQ0FBQyxFQUNmLFFBQUEsY0FBYyxHQUFHLENBQUMsRUFDbEIsUUFBQSxZQUFZLEdBQUcsQ0FBQyxFQUNoQixRQUFBLFlBQVksR0FBRyxDQUFDLEVBQ2hCLFFBQUEsV0FBVyxHQUFHLENBQUMsRUFDZixRQUFBLFdBQVcsR0FBRyxDQUFDLEVBQ2YsUUFBQSxXQUFXLEdBQUcsQ0FBQyxFQUNmLFFBQUEsY0FBYyxHQUFHLENBQUMsRUFDbEIsUUFBQSxhQUFhLEdBQUcsQ0FBQyxFQUNqQixRQUFBLFlBQVksR0FBRyxFQUFFLEVBQ2pCLFFBQUEsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUVKLFFBQUEsZUFBZSxHQUFHLENBQUMsRUFDOUIsUUFBQSxZQUFZLEdBQUcsQ0FBQyxFQUNoQixRQUFBLFlBQVksR0FBRyxDQUFDLEVBQ2hCLFFBQUEsYUFBYSxHQUFHLENBQUMsQ0FBQztBQUVQLFFBQUEsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsUUFBQSxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUV0QixRQUFBLFdBQVcsR0FBRyxpQkFBUyxHQUFHLG9CQUFZLENBQUM7QUFFdkMsUUFBQSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBRWxCLFFBQUEsT0FBTyxHQUFHLFVBQVUsQ0FBQztBQUVyQixRQUFBLGdCQUFnQixHQUFHLENBQUMsRUFDL0IsUUFBQSxpQkFBaUIsR0FBRyxDQUFDLEVBQ3JCLFFBQUEsZUFBZSxHQUFHLENBQUMsRUFDbkIsUUFBQSxlQUFlLEdBQUcsQ0FBQyxFQUNuQixRQUFBLFVBQVUsR0FBRyxDQUFDLElBQUksd0JBQWdCLEVBQ2xDLFFBQUEsV0FBVyxHQUFHLENBQUMsSUFBSSx5QkFB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