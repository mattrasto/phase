export default class Phase {
  // Creates a phase
  constructor(network, label) {
    this.network = network;
    this.label = label;

    this.root = null;

    // Settings
    // TODO: Consider moving into state or exposing
    this.timeStep = 500; // Time between execution tree layer applications

    // Internal state
    // TODO: Consider moving into state or exposing
    this.curLayer = 0; // Current layer of the phase's execution
    this.interval = null; // Interval ID for the phase
    this.layerNodes = []; // Array of MorphNodes present in each layer of the execution tree

    // External state
    this.state = {}; // State variables belonging to state

    // Morphs and groups associated with the phase
    this.morphs = {};
    this.nodeGroups = {};
    this.linkGroups = {};

    // Function called on when phase is initialized
    this.initial = null;
    // Function called on each timestep to compute phase's next state
    this.transition = null;
    // Function called to determine whether the phase is finished
    this.terminal = null;

    return this;
  }

  // Updates or returns the current state
  state(updatedState) {
    if (updatedState === undefined) return this.state;
    updatedState.keys().forEach((key) => {
      this.state[key] = updatedState[key];
    });
    return null;
  }

  initial(initial) {
    this.initial = initial;
  }

  next(transition) {
    this.transition = transition;
  }

  end(terminal) {
    this.terminal = terminal;
  }

  updateTimestep(newValue) {
    this.timeStep = newValue;
  }

  calculateNextState() {
    this.transition(this.state(), this.network.state());
  }

  evaluateTermination() {
    if (this.terminal(this.state(), this.network.state())) {
      return true;
    }
    return false;
  }

  // Stop the phase's application but don't clear settings/state
  stop() {
    clearInterval(this.interval);
  }

  // Reset the phase to its initial settings/state
  reset() {
    this.state = {};

    this.morphs.keys().forEach((morph) => {
      this.morphs[morph].destroy();
    });
    this.morphs = {};
    this.nodeGroups.keys().forEach((nodeGroup) => {
      this.nodeGroups[nodeGroup].destroy();
    });
    this.nodeGroups = {};
    this.linkGroups.keys().forEach((linkGroup) => {
      this.linkGroups[linkGroup].destroy();
    });
    this.linkGroups = {};
  }

  // Teardown the phase along with its associated groups/morphs and remove from viz
  destroy() {
    this.morphs.keys().forEach((morph) => {
      this.morphs[morph].destroy();
    });
    this.morphs = {};
    this.nodeGroups.keys().forEach((nodeGroup) => {
      this.nodeGroups[nodeGroup].destroy();
    });
    this.nodeGroups = {};
    this.linkGroups.keys().forEach((linkGroup) => {
      this.linkGroups[linkGroup].destroy();
    });
    this.linkGroups = {};

    delete this.network.phases[this.label];
  }

  // Begins the simulation
  start() {
    // TODO: Only initialize if the simulation has not been started yet or has been reset
    this.initial(this.state(), this.network.state());

    function step() {
      this.calculateNextState();
      if (this.evaluateTermination()) this.stop();
    }

    if (this.transition) {
      this.interval = setInterval(step.bind(this), this.timeStep);
    }
  }

  // Morphs and Groups instantiated and stored within a phase

  // Creates a new node group
  nodeGroup(label, filterer, val) {
    const nodeGroup = this.network.nodeGroup.call(this.network, label, filterer, val);
    nodeGroup.phase = this.label;
    this.nodeGroups[label] = nodeGroup;
    return nodeGroup;
  }

  getNodeGroup(label) {
    return this.nodeGroups[label];
  }

  getAllNodeGroups() {
    return this.nodeGroups;
  }

  // Creates a new node group
  linkGroup(label, filterer, val) {
    const linkGroup = this.network.linkGroup.call(this.network, label, filterer, val);
    linkGroup.phase = this.label;
    this.linkGroups[label] = linkGroup;
    return linkGroup;
  }

  getLinkGroup(label) {
    return this.linkGroups[label];
  }

  getAllLinkGroups() {
    return this.linkGroups;
  }

  morph(label, type, change) {
    const morph = this.network.morph.call(this, label, type, change);
    morph.phase = this.label;
    this.morphs[label] = morph;
    return morph;
  }

  getMorph(label) {
    return this.morphs[label];
  }

  getAllMorphs() {
    return this.morphs;
  }
} // End Phase Class
