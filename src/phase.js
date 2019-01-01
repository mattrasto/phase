export default class Phase {
  // Creates a phase
  constructor(network, label) {
    this.network = network;
    this.label = label;

    this._root = null;

    // Settings
    // TODO: Consider moving into state or exposing
    this._timeStep = 500; // Time between execution tree layer applications

    // Internal state
    // TODO: Consider moving into state or exposing
    this._curLayer = 0; // Current layer of the phase's execution
    this._interval = null; // Interval ID for the phase
    this._layerNodes = []; // Array of MorphNodes present in each layer of the execution tree

    // External state
    this._state = {}; // State variables belonging to state

    // Morphs and groups associated with the phase
    this._morphs = {};
    this._nodeGroups = {};
    this._linkGroups = {};

    // Function called on when phase is initialized
    this._initial;
    // Function called on each timestep to compute phase's next state
    this._transition;
    // Function called to determine whether the phase is finished
    this._terminal;

    return this;
  }

  // Updates or returns the current state
  state(updatedState) {
    if (updatedState == undefined) return this._state;
    for (const key in updatedState) {
        this._state[key] = updatedState[key];
    }
  }

  initial(initial) {
    this._initial = initial;
  }

  next(transition) {
    this._transition = transition;
  }

  end(terminal) {
    this._terminal = terminal;
  }

  updateTimestep(newValue){
    this._timeStep = newValue;
  }

  _calculateNextState() {
    this._transition(this.state(), this.network.state())
  }

  _evaluateTermination() {
    if(this._terminal(this.state(), this.network.state())){
      return true;
    }
    return false;
  }

  // Stop the phase's application but don't clear settings/state
  stop() {
    clearInterval(this._interval);
  }

  // Reset the phase to its initial settings/state
  reset() {
    this._state = {};

    for (const morph in this._morphs) {
      this._morphs[morph].destroy();
    }
    this._morphs = {};
    for (const nodeGroup in this._nodeGroups) {
      this._nodeGroups[nodeGroup].destroy();
    }
    this._nodeGroups = {};
    for (const linkGroup in this._linkGroups) {
      this._linkGroups[linkGroup].destroy();
    }
    this._linkGroups = {};
  }

  // Teardown the phase along with its associated groups/morphs and remove from viz
  destroy() {
    for (const morph in this._morphs) {
      this._morphs[morph].destroy();
    }
    this._morphs = {};
    for (const nodeGroup in this._nodeGroups) {
      this._nodeGroups[nodeGroup].destroy();
    }
    this._nodeGroups = {};
    for (const linkGroup in this._linkGroups) {
      this._linkGroups[linkGroup].destroy();
    }
    this._linkGroups = {};

    delete this.network._phases[this.label];
  }

  // Begins the simulation
  start() {

    // TODO: Only initialize if the simulation has not been started yet or has been reset
    this._initial(this.state(), this.network.state());

    if (this._transition) {
      function step() {
        this._calculateNextState();
        if (this._evaluateTermination()) this.stop();
      }
      this._interval = setInterval(step.bind(this), this._timeStep);
      return;
    }
  }

  // Morphs and Groups instantiated and stored within a phase

  // Creates a new node group
  nodeGroup(label, filterer, val) {
    let nodeGroup = this.network.nodeGroup.call(this.network, label, filterer, val);
    nodeGroup.phase = this.label;
    this._nodeGroups[label] = nodeGroup;
    return nodeGroup;
  }

  getNodeGroup(label) {
    return this._nodeGroups[label];
  }

  getAllNodeGroups() {
    return this._nodeGroups;
  }

  // Creates a new node group
  linkGroup(label, filterer, val) {
    let linkGroup = this.network.linkGroup.call(this.network, label, filterer, val);
    linkGroup.phase = this.label;
    this._linkGroups[label] = linkGroup;
    return linkGroup;
  }

  getLinkGroup(label) {
    return this._linkGroups[label];
  }

  getAllLinkGroups() {
    return this._linkGroups;
  }

  morph(label, type, change) {
    let morph = this.network.morph.call(this, label, type, change);
    morph.phase = this.label;
    this._morphs[label] = morph;
    return morph;
  }

  getMorph(label) {
    return this._morphs[label];
  }

  getAllMorphs() {
    return this._morphs;
  }
} // End Phase Class
