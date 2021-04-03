export class VSlot {
    /**
     * VSlot Constructor
     */
    constructor(slot, index = -1) {
        this.slot = slot;
        this.index = index;
        this.next = null;
        this.changed = 0;
        this.params = [];
        this.linked = false;
        this.scale = 1.0;
        this.rotation = 0;
        this.offset = [0, 0];
        this.scroll = [0, 0];
        this.layer = 0;
        this.detail = 0;
        this.alphafront = 0.5;
        this.alphaback = 0.0;
        this.colorscale = [1, 1, 1];
        this.glowcolor = [1, 1, 1];
        this.refractscale = 0.0;
        this.refractcolor = [1, 1, 1];
        this._tex = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNsb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVlNsb3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxPQUFPLEtBQUs7SUFxQmhCOztPQUVHO0lBQ0gsWUFBbUIsSUFBWSxFQUFTLFFBQVEsQ0FBQyxDQUFDO1FBQS9CLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFLO1FBdkJsRCxTQUFJLEdBQVUsSUFBSyxDQUFDO1FBRXBCLFlBQU8sR0FBRyxDQUFDLENBQUM7UUFDWixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osV0FBTSxHQUFHLEtBQUssQ0FBQztRQUNmLFVBQUssR0FBRyxHQUFHLENBQUM7UUFDWixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsV0FBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLFdBQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQixVQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsV0FBTSxHQUFHLENBQUMsQ0FBQztRQUNYLGVBQVUsR0FBRyxHQUFHLENBQUM7UUFDakIsY0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNoQixlQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLGNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdEIsaUJBQVksR0FBRyxHQUFHLENBQUM7UUFDbkIsaUJBQVksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFekIsU0FBSSxHQUFpQixJQUFJLENBQUM7SUFLMkIsQ0FBQztDQUN2RCJ9