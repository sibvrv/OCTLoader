"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCTModel = void 0;
const binary_file_1 = require("binary-file");
const OCTTypes_1 = require("./OCTTypes");
const TCubes_1 = require("./TCubes");
const VSlot_1 = require("./VSlot");
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
class OCTModel {
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
        this.settings = Object.assign(Object.assign({}, this.settings), settings);
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
                    c.children[i] = new TCubes_1.TCubes();
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
                const cube = new TCubes_1.TCubes();
                hdr.cubes.push(cube);
                unpackcube(cube);
            }
            return true;
        };
        unpackblock();
    }
    load(contents) {
        const io = new binary_file_1.BinaryFile(contents);
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
        io.seek(extrasize, binary_file_1.BinaryFile.SEEK_CUR);
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
            if (changed & (1 << OCTTypes_1.VSLOT_SHPARAM)) {
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
            if (changed & (1 << OCTTypes_1.VSLOT_SCALE))
                vs.scale = io.readFloat();
            if (changed & (1 << OCTTypes_1.VSLOT_ROTATION))
                vs.rotation = io.readLong();
            if (changed & (1 << OCTTypes_1.VSLOT_OFFSET)) {
                for (let k = 0; k < 2; k++) {
                    vs.offset[k] = io.readLong();
                }
            }
            if (changed & (1 << OCTTypes_1.VSLOT_SCROLL)) {
                for (let k = 0; k < 2; k++) {
                    vs.scroll[k] = io.readFloat();
                }
            }
            if (changed & (1 << OCTTypes_1.VSLOT_LAYER))
                vs.layer = io.readLong();
            if (changed & (1 << OCTTypes_1.VSLOT_ALPHA)) {
                vs.alphafront = io.readFloat();
                vs.alphaback = io.readFloat();
            }
            if (changed & (1 << OCTTypes_1.VSLOT_COLOR)) {
                for (let k = 0; k < 3; k++) {
                    vs.colorscale[k] = io.readFloat();
                }
            }
            if (changed & (1 << OCTTypes_1.VSLOT_REFRACT)) {
                vs.refractscale = io.readFloat();
                for (let k = 0; k < 3; k++) {
                    vs.refractcolor[k] = io.readFloat();
                }
            }
            if (changed & (1 << OCTTypes_1.VSLOT_DETAIL))
                vs.detail = io.readLong();
        }
        const vslots = (mdl.vslots = []);
        let numvslots = hdr.numvslots;
        const prev = new Array(numvslots);
        while (numvslots > 0) {
            const changed = io.readLong();
            if (changed < 0) {
                for (let i = 0; i < -changed; i++)
                    vslots.push(new VSlot_1.VSlot(null, vslots.length));
                numvslots += changed;
            }
            else {
                prev[vslots.length] = io.readLong();
                const vs = new VSlot_1.VSlot(null, vslots.length);
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
                case OCTTypes_1.OCTSAV_CHILDREN:
                    c.children = loadchildren(co, size >> 1);
                    return;
                case OCTTypes_1.OCTSAV_EMPTY:
                    c.emptyfaces();
                    break;
                case OCTTypes_1.OCTSAV_SOLID:
                    c.solidfaces();
                    break;
                case OCTTypes_1.OCTSAV_NORMAL:
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
                        const numverts = surf.numverts & OCTTypes_1.MAXFACEVERTS;
                        if (!numverts) {
                            surf.verts = 0;
                            continue;
                        }
                        surf.verts = offset;
                        offset += numverts;
                        const layerverts = surf.numverts & OCTTypes_1.MAXFACEVERTS;
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
                                if (surf.numverts & OCTTypes_1.LAYER_DUP)
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
                        if (hasuv && surf.numverts & OCTTypes_1.LAYER_DUP)
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
                cubes.push((c = new TCubes_1.TCubes()));
                loadc(c, ivec(i, co, size), size);
                if (failed)
                    break;
            }
            return cubes;
        }
        this.worldroot = loadchildren([0, 0, 0], hdr.worldsize >> 1);
    }
}
exports.OCTModel = OCTModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT0NUTG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09DVExvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBeUM7QUFFekMseUNBdUJvQjtBQUNwQixxQ0FBa0M7QUFDbEMsbUNBQWdDO0FBRWhDLE1BQU0sZUFBZTtJQUFyQjtRQUNFLFNBQUksR0FBRyxFQUFFLENBQUM7UUFDVixRQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDVCxVQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRVYsUUFBRyxHQUFxQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FBQTtBQUVELE1BQU0sTUFBTTtJQUFaO1FBQ0UsTUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWE7UUFDdkMsTUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWE7UUFJdkMsVUFBSyxHQUFhLEVBQUUsQ0FBQztJQUt2QixDQUFDO0lBSEMsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEMsQ0FBQztDQUNGO0FBRUQsTUFBYSxRQUFRO0lBYW5CLFlBQVksUUFBK0I7UUFaM0MsY0FBUyxHQUFhLEVBQUUsQ0FBQztRQUN6QixTQUFJLEdBQVksRUFBRSxDQUFDO1FBRW5CLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFDdEIsV0FBTSxHQUF3QixFQUFFLENBQUM7UUFDakMsV0FBTSxHQUFZLEVBQUUsQ0FBQztRQUNyQixTQUFJLEdB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