import { BinaryFile } from 'binary-file';
import { IEntity, IEntityV2, IOCTHeader, IOCTSettings, IVars } from './OCTTypes';
import { TCubes } from './TCubes';
import { VSlot } from './VSlot';
export declare class OCTModel {
    worldroot: TCubes[];
    vars: IVars[];
    gametype: string;
    texmru: number[];
    header: Partial<IOCTHeader>;
    vslots: VSlot[];
    ents: (IEntity | IEntityV2)[];
    settings: IOCTSettings;
    constructor(settings: Partial<IOCTSettings>);
    texturesToVSlot(): void;
    loadPrefab(io: BinaryFile): void;
    load(contents: any): void;
}
