export declare class TCubes {
    material: number;
    children: TCubes[];
    edges: Uint8Array;
    faces: Uint32Array;
    texture: number[];
    merged: number;
    constructor(face?: number, material?: number);
    setfaces(face: any): void;
    solidfaces(): void;
    emptyfaces(): void;
    isempty(): boolean;
    isentirelysolid(): boolean;
}
