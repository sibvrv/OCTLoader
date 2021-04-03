import { BinaryFile } from 'binary-file';
import { LAYER_DUP, MAXFACEVERTS, OCTSAV_CHILDREN, OCTSAV_EMPTY, OCTSAV_NORMAL, OCTSAV_SOLID, VSLOT_ALPHA, VSLOT_COLOR, VSLOT_DETAIL, VSLOT_LAYER, VSLOT_OFFSET, VSLOT_REFRACT, VSLOT_ROTATION, VSLOT_SCALE, VSLOT_SCROLL, VSLOT_SHPARAM, } from './OCTTypes';
import { TCubes } from './TCubes';
import { VSlot } from './VSlot';
class SlotShaderParam {
    constructor() {
        this.name = '';
        this.loc = -1;
        this.flags = 0;
        this.val = [0, 0, 0, 0];
    }
}
class Block3 {
    constructor() {
        this.o = { x: 0, y: 0, z: 0 }; // 4 * 3 = 12
        this.s = { x: 0, y: 0, z: 0 }; // 4 * 3 = 12
        this.cubes = [];
    }
    size() {
        return this.s.x * this.s.y * this.s.z;
    }
}
export class OCTModel {
    constructor(settings) {
        this.worldroot = [];
        this.vars = [];
        this.texmru = [];
        this.header = {};
        this.vslots = [];
        this.ents = [];
        this.settings = {
            textures: [],
        };
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
    loadPrefab(io) {
        // const mdl = this;
        const unpackcube = (c) => {
            const mat = io.readUByte();
            if (mat == 0xff) {
                c.children = [];
                for (let i = 0; i < 8; i++) {
                    c.children[i] = new TCubes();
                    unpackcube(c.children[i]);
                }
            }
            else {
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
        function ReadHeader(magic, version) {
            switch (magic) {
                case 'TMAP':
                    return {
                        magic,
                        version: version,
                        headersize: io.readLong(),
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
                        headersize: io.readLong(),
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
                const e = {};
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
        }
        else {
            for (let i = 0; i < hdr.numents; i++) {
                const e = {};
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
        function loadvslot(vs, changed) {
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
            if (changed & (1 << VSLOT_SCALE))
                vs.scale = io.readFloat();
            if (changed & (1 << VSLOT_ROTATION))
                vs.rotation = io.readLong();
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
            if (changed & (1 << VSLOT_LAYER))
                vs.layer = io.readLong();
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
            if (changed & (1 << VSLOT_DETAIL))
                vs.detail = io.readLong();
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
            }
            else {
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
        function loadc(c, co, size) {
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
            if (octsav & 0x40)
                c.material = io.readUShort();
            if (octsav & 0x80)
                c.merged = io.readUByte();
            if (octsav & 0x20) {
                const surfmask = io.readUByte();
                /* const totalverts = */ io.readUByte();
                let offset = 0;
                for (let i = 0; i < 6; i++)
                    if (surfmask & (1 << i)) {
                        const surf = {};
                        if (hdr.version <= 0) {
                            io.readUByte();
                            io.readUByte();
                            surf.verts = io.readUByte();
                            surf.numverts = io.readUByte();
                        }
                        else {
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
                        let hasxyz = (vertmask & 0x04) != 0, hasuv = hdr.version <= 0 && (vertmask & 0x40) != 0, hasnorm = (vertmask & 0x80) != 0;
                        if (layerverts == 4) {
                            if (hasxyz && vertmask & 0x01) {
                                io.readUShort();
                                io.readUShort();
                                io.readUShort();
                                io.readUShort();
                                hasxyz = false;
                            }
                            if (hasuv && vertmask & 0x02) {
                                for (let k = 0; k < 4; k++)
                                    io.readUShort();
                                if (surf.numverts & LAYER_DUP)
                                    for (let k = 0; k < 4; k++)
                                        io.readUShort();
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
                                if (hasnorm)
                                    io.readUShort();
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
                if (failed)
                    break;
            }
            return cubes;
        }
        this.worldroot = loadchildren([0, 0, 0], hdr.worldsize >> 1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT0NUTG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09DVExvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBRXpDLE9BQU8sRUFPTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLGVBQWUsRUFDZixZQUFZLEVBQ1osYUFBYSxFQUNiLFlBQVksRUFDWixXQUFXLEVBQ1gsV0FBVyxFQUNYLFlBQVksRUFDWixXQUFXLEVBQ1gsWUFBWSxFQUNaLGFBQWEsRUFDYixjQUFjLEVBQ2QsV0FBVyxFQUNYLFlBQVksRUFDWixhQUFhLEdBQ2QsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBRWhDLE1BQU0sZUFBZTtJQUFyQjtRQUNFLFNBQUksR0FBRyxFQUFFLENBQUM7UUFDVixRQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDVCxVQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRVYsUUFBRyxHQUFxQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FBQTtBQUVELE1BQU0sTUFBTTtJQUFaO1FBQ0UsTUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWE7UUFDdkMsTUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWE7UUFJdkMsVUFBSyxHQUFhLEVBQUUsQ0FBQztJQUt2QixDQUFDO0lBSEMsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFD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