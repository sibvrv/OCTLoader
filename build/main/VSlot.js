"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSlot = void 0;
class VSlot {
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
exports.VSlot = VSlot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlNsb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVlNsb3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxLQUFLO0lBcUJoQjs7T0FFRztJQUNILFlBQW1CLElBQVksRUFBUyxRQUFRLENBQUMsQ0FBQztRQUEvQixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBSztRQXZCbEQsU0FBSSxHQUFVLElBQUssQ0FBQztRQUVwQixZQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ1osV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFDZixVQUFLLEdBQUcsR0FBRyxDQUFDO1FBQ1osYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNiLFdBQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQixXQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEIsVUFBSyxHQUFHLENBQUMsQ0FBQztRQUNWLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxlQUFVLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLGNBQVMsR0FBRyxHQUFHLENBQUM7UUFDaEIsZUFBVSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLGlCQUFZLEdBQUcsR0FBRyxDQUFDO1FBQ25CLGlCQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXpCLFNBQUksR0FBaUIsSUFBSSxDQUFDO0lBSzJCLENBQUM7Q0FDdkQ7QUF6QkQsc0JBeUJDIn0=