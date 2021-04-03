import { BinaryFile } from 'binary-file';

import {
  IEntity,
  IEntityV2,
  IOCTHeader,
  IOCTSettings,
  ISurfaceInfo,
  IVars,
  LAYER_DUP,
  MAXFACEVERTS,
  OCTSAV_CHILDREN,
  OCTSAV_EMPTY,
  OCTSAV_NORMAL,
  OCTSAV_SOLID,
  VSLOT_ALPHA,
  VSLOT_COLOR,
  VSLOT_DETAIL,
  VSLOT_LAYER,
  VSLOT_OFFSET,
  VSLOT_REFRACT,
  VSLOT_ROTATION,
  VSLOT_SCALE,
  VSLOT_SCROLL,
  VSLOT_SHPARAM,
} from './OCTTypes';
import { TCubes } from './TCubes';
import { VSlot } from './VSlot';

class SlotShaderParam {
  name = '';
  loc = -1;
  flags = 0;

  val: [number, number, number, number] = [0, 0, 0, 0];
}

class Block3 {
  o = { x: 0, y: 0, z: 0 }; // 4 * 3 = 12
  s = { x: 0, y: 0, z: 0 }; // 4 * 3 = 12
  grid: number; // 4
  orient: number; // 4

  cubes: TCubes[] = [];

  size() {
    return this.s.x * this.s.y * this.s.z;
  }
}

export class OCTModel {
  worldroot: TCubes[] = [];
  vars: IVars[] = [];
  gametype: string;
  texmru: number[] = [];
  header: Partial<IOCTHeader> = {};
  vslots: VSlot[] = [];
  ents: (IEntity | IEntityV2)[] = [];

  settings: IOCTSettings = {
    textures: [],
  };

  constructor(settings: Partial<IOCTSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  texturesToVSlot() {
    const { vslots } = this;
    const { textures } = this.settings;

    for (let i = 0; i < vslots.length; i++) {
      let slot = vslots[i];

      if (slot.index < textures.length) {
        slot._tex = textures[i];
      }

      while ((slot = slot.next)) {
        slot._tex = textures[i];
      }
    }
  }

  loadPrefab(io: BinaryFile) {
    // const mdl = this;

    const unpackcube = (c: TCubes) => {
      const mat = io.readUByte();
      if (mat == 0xff) {
        c.children = [];
        for (let i = 0; i < 8; i++) {
          c.children[i] = new TCubes();
          unpackcube(c.children[i]);
        }
      } else {
        c.material = mat | (io.readUByte() << 8);
        // console.log('mat', c.material);
        for (let k = 0; k < 12; k++) {
          c.edges[k] = io.readUByte();
        }

        for (let i = 0; i < 6; i++) {
          c.texture[i] = io.readUShort();
        }
      }
    };

    const unpackblock = () => {
      const hdr = new Block3();
      hdr.o.x = io.readLong();
      hdr.o.y = io.readLong();
      hdr.o.z = io.readLong();

      hdr.s.x = io.readLong();
      hdr.s.y = io.readLong();
      hdr.s.z = io.readLong();

      hdr.grid = io.readLong();
      hdr.orient = io.readLong();

      if (hdr.size() > 1 << 20 || hdr.grid <= 0 || hdr.grid > 1 << 12) {
        return false;
      }

      for (let i = 0; i < hdr.size(); i++) {
        const cube = new TCubes();
        hdr.cubes.push(cube);
        unpackcube(cube);
      }

      return true;
    };

    unpackblock();
  }

  load(contents) {
    const io = new BinaryFile(contents);
    const mdl = this;

    function ReadHeader(magic: string, version: number): IOCTHeader {
      switch (magic) {
        case 'TMAP':
          return {
            magic,
            version: version, // any >8bit quantity is little endian
            headersize: io.readLong(), // sizeof(header)
            worldsize: io.readLong(),
            numents: io.readLong(),
            numpvs: io.readLong(),
            blendmap: io.readLong(),
            numvars: io.readLong(),
            numvslots: io.readLong(),
          };

        case 'OCTA':
          return {
            magic,
            version: 0,
            headersize: io.readLong(), // sizeof(header)
            worldsize: io.readLong(),
            numents: io.readLong(),
            numpvs: io.readLong(),
            lightmaps: io.readLong(),
            blendmap: io.readLong(),
            numvars: io.readLong(),
            numvslots: io.readLong(),
          };
      }
      throw new Error(`map uses an unsupported map type ${magic}`);
    }

    const magic = io.readString(4);
    const version = io.readLong();

    if (magic === 'OEBR') {
      return this.loadPrefab(io);
    }

    const hdr = (this.header = ReadHeader(magic, version));
    const ID_VAR = 0;
    const ID_FVAR = 1;
    const ID_SVAR = 2;
    const vars = (mdl.vars = []);
    for (let i = 0; i < hdr.numvars; i++) {
      const type = io.readUByte();
      const ilen = io.readUShort();
      const name = io.readString(ilen);
      let value = null;

      switch (type) {
        case ID_VAR:
          value = io.readLong();
          break;
        case ID_FVAR:
          value = io.readFloat();
          break;
        case ID_SVAR: {
          const slen = io.readUShort();
          value = io.readString(slen);
          break;
        }
      }

      vars.push({
        name: name,
        value: value,
      });
    }

    const len = io.readUByte();
    mdl.gametype = io.readString(len);
    io.readUByte(); // wtf ?!

    /* const eif = */ io.readUShort();
    const extrasize = io.readUShort();
    io.seek(extrasize, BinaryFile.SEEK_CUR);

    const texmru = [];
    const nummru = io.readUShort();
    for (let i = 0; i < nummru; i++) {
      texmru.push(io.readUShort());
    }
    mdl.texmru = texmru;

    const ents = (mdl.ents = []);
    const v = hdr.version;
    if (v <= 2) {
      for (let i = 0; i < hdr.numents; i++) {
        const e: Partial<IEntity> = {};
        e.x = io.readFloat();
        e.y = io.readFloat();
        e.z = io.readFloat();
        e.attr1 = io.readUShort();
        e.attr2 = io.readUShort();
        e.attr3 = io.readUShort();
        e.attr4 = io.readUShort();
        e.attr5 = io.readUShort();
        e.type = io.readUByte();
        e.reserved = io.readUByte();

        ents.push(e);
      }
    } else {
      for (let i = 0; i < hdr.numents; i++) {
        const e: Partial<IEntityV2> = {};
        e.type = io.readUByte();
        e.params = io.readUByte();

        e.x = io.readFloat();
        e.y = io.readFloat();
        e.z = io.readFloat();
        e.attr1 = io.readUShort();
        e.attr2 = io.readUShort();
        e.attr3 = io.readUShort();
        e.attr4 = io.readUShort();
        e.attr5 = io.readUShort();

        const l = io.readUByte();
        e.name = io.readString(l);

        ents.push(e);
      }
    }

    function loadvslot(vs: VSlot, changed) {
      vs.changed = changed;
      if (changed & (1 << VSLOT_SHPARAM)) {
        const numparams = io.readUShort();
        for (let i = 0; i < numparams; i++) {
          const p = new SlotShaderParam();
          vs.params.push(p);
          const nlen = io.readUShort();
          p.name = io.readString(nlen);
          p.loc = -1;
          for (let k = 0; k < 4; k++) {
            p.val[k] = io.readFloat();
          }
        }
      }
      if (changed & (1 << VSLOT_SCALE)) vs.scale = io.readFloat();
      if (changed & (1 << VSLOT_ROTATION)) vs.rotation = io.readLong();
      if (changed & (1 << VSLOT_OFFSET)) {
        for (let k = 0; k < 2; k++) {
          vs.offset[k] = io.readLong();
        }
      }
      if (changed & (1 << VSLOT_SCROLL)) {
        for (let k = 0; k < 2; k++) {
          vs.scroll[k] = io.readFloat();
        }
      }
      if (changed & (1 << VSLOT_LAYER)) vs.layer = io.readLong();
      if (changed & (1 << VSLOT_ALPHA)) {
        vs.alphafront = io.readFloat();
        vs.alphaback = io.readFloat();
      }
      if (changed & (1 << VSLOT_COLOR)) {
        for (let k = 0; k < 3; k++) {
          vs.colorscale[k] = io.readFloat();
        }
      }
      if (changed & (1 << VSLOT_REFRACT)) {
        vs.refractscale = io.readFloat();
        for (let k = 0; k < 3; k++) {
          vs.refractcolor[k] = io.readFloat();
        }
      }
      if (changed & (1 << VSLOT_DETAIL)) vs.detail = io.readLong();
    }

    const vslots = (mdl.vslots = []);
    let numvslots = hdr.numvslots;
    const prev = new Array(numvslots);
    while (numvslots > 0) {
      const changed = io.readLong();
      if (changed < 0) {
        for (let i = 0; i < -changed; i++)
          vslots.push(new VSlot(null, vslots.length));
        numvslots += changed;
      } else {
        prev[vslots.length] = io.readLong();

        const vs = new VSlot(null, vslots.length);
        vslots.push(vs);

        loadvslot(vs, changed);
        numvslots--;
      }
    }

    for (let i = 0; i < vslots.length; i++) {
      if (prev[i] !== null && prev[i] < vslots.length) {
        vslots[prev[i]].next = vslots[i];
      }
    }

    this.texturesToVSlot();

    let failed = false;

    function loadc(c: TCubes, co, size) {
      const octsav = io.readUByte();
      switch (octsav & 0x7) {
        case OCTSAV_CHILDREN:
          c.children = loadchildren(co, size >> 1);
          return;

        case OCTSAV_EMPTY:
          c.emptyfaces();
          break;
        case OCTSAV_SOLID:
          c.solidfaces();
          break;
        case OCTSAV_NORMAL:
          for (let k = 0; k < 12; k++) {
            c.edges[k] = io.readUByte();
          }
          break;
        default:
          failed = true;
          return;
      }
      for (let i = 0; i < 6; i++) {
        c.texture[i] = io.readUShort();
      }
      if (octsav & 0x40) c.material = io.readUShort();
      if (octsav & 0x80) c.merged = io.readUByte();
      if (octsav & 0x20) {
        const surfmask = io.readUByte();
        /* const totalverts = */ io.readUByte();

        let offset = 0;
        for (let i = 0; i < 6; i++)
          if (surfmask & (1 << i)) {
            const surf: Partial<ISurfaceInfo> = {};
            if (hdr.version <= 0) {
              io.readUByte();
              io.readUByte();
              surf.verts = io.readUByte();
              surf.numverts = io.readUByte();
            } else {
              surf.verts = io.readUByte();
              surf.numverts = io.readUByte();
            }
            const vertmask = surf.verts;
            const numverts = surf.numverts & MAXFACEVERTS;
            if (!numverts) {
              surf.verts = 0;
              continue;
            }
            surf.verts = offset;
            offset += numverts;

            const layerverts = surf.numverts & MAXFACEVERTS;

            let hasxyz = (vertmask & 0x04) != 0,
              hasuv = hdr.version <= 0 && (vertmask & 0x40) != 0,
              hasnorm = (vertmask & 0x80) != 0;
            if (layerverts == 4) {
              if (hasxyz && vertmask & 0x01) {
                io.readUShort();
                io.readUShort();
                io.readUShort();
                io.readUShort();
                hasxyz = false;
              }
              if (hasuv && vertmask & 0x02) {
                for (let k = 0; k < 4; k++) io.readUShort();
                if (surf.numverts & LAYER_DUP)
                  for (let k = 0; k < 4; k++) io.readUShort();
                hasuv = false;
              }
            }
            if (hasnorm && vertmask & 0x08) {
              io.readUShort();
              hasnorm = false;
            }
            if (hasxyz || hasuv || hasnorm)
              for (let k = 0; k < layerverts; k++) {
                if (hasxyz) {
                  io.readUShort();
                  io.readUShort();
                }
                if (hasuv) {
                  io.readUShort();
                  io.readUShort();
                }
                if (hasnorm) io.readUShort();
              }
            if (hasuv && surf.numverts & LAYER_DUP)
              for (let k = 0; k < layerverts; k++) {
                io.readUShort();
                io.readUShort();
              }
          }
      }
    }

    function ivec(i, co, size) {
      return [
        co[0] + ((i & 1) >> 0) * size,
        co[1] + ((i & 2) >> 1) * size,
        co[2] + ((i & 4) >> 2) * size,
      ];
    }

    function loadchildren(co, size) {
      const cubes = [];
      let c;
      for (let i = 0; i < 8; i++) {
        cubes.push((c = new TCubes()));
        loadc(c, ivec(i, co, size), size);

        if (failed) break;
      }
      return cubes;
    }

    this.worldroot = loadchildren([0, 0, 0], hdr.worldsize >> 1);
  }
}
