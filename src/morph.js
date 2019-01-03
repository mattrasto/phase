export default class Morph {
  // Creates a morph
  constructor(network, label, type, change) {
    this.network = network;
    this.label = label;
    this.type = type;
    this.change = change;

    // Phase the morph is associated with
    this.phase = null;

    return this;
  }

  destroy() {
    if (this.label in this.network.morphs) {
      delete this.network.morphs[this.label];
    }
  }
} // End Morph Class
