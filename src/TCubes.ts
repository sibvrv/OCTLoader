import { F_EMPTY, F_SOLID, MAT_AIR } from './OCTTypes';

export class TCubes {
  children: TCubes[] = null;
  edges: Uint8Array;
  faces: Uint32Array;
  texture = [1, 1, 1, 1, 1, 1];
  merged = 0;

  constructor(face = F_EMPTY, public material = MAT_AIR) {
    const mem = new ArrayBuffer(12); // union
    this.edges = new Uint8Array(mem);
    this.faces = new Uint32Array(mem); // union
    //
    this.setfaces(face);
  }

  setfaces(face) {
    this.faces[0] = this.faces[1] = this.faces[2] = face;
  }

  solidfaces() {
    this.setfaces(F_SOLID);
  }

  emptyfaces() {
    this.setfaces(F_EMPTY);
  }

  isempty() {
    return this.faces[0] === F_EMPTY;
  }

  isentirelysolid() {
    return (
      this.faces[0] == F_SOLID &&
      this.faces[1] == F_SOLID &&
      this.faces[2] == F_SOLID
    );
  }
}
