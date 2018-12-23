export default class Morph {
    // Creates a morph
    constructor(network, label, type, change) {
        this._network = network;
        this.label = label;
        this._type = type;
        this._change = change;

        // Phase the morph is associated with
        this.phase = null;

        return this;
    }

    destroy() {
        if (this.label in this._network._morphs) {
            delete this._network._morphs[this.label];
        }
    }
} // End Morph Class