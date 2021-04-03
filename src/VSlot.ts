import { ITextureInfo } from './OCTTypes';

export class VSlot {
  next: VSlot = null!;

  changed = 0;
  params = [];
  linked = false;
  scale = 1.0;
  rotation = 0;
  offset = [0, 0];
  scroll = [0, 0];
  layer = 0;
  detail = 0;
  alphafront = 0.5;
  alphaback = 0.0;
  colorscale = [1, 1, 1];
  glowcolor = [1, 1, 1];
  refractscale = 0.0;
  refractcolor = [1, 1, 1];

  _tex: ITextureInfo = null;

  /**
   * VSlot Constructor
   */
  constructor(public slot: number, public index = -1) {}
}
