export default class Phase {
  // Creates a phase
  constructor(network, label) {
    this.network = network;
    this.label = label;

    // Settings
    this.timeStep = 500; // Time between execution tree layer applications
    this.interval = null; // Interval function for the phase

    // External state
    this.phaseState = {}; // State variables belonging to state

    // Morphs and groups associated with the phase
    this.morphs = {};
    this.nodeGroups = {};
    this.linkGroups = {};

    // Function called on when phase is initialized
    this.initialFunction = () => {};
    // Function called on each timestep to compute phase's next state
    this.transitionFunction = () => {};
    // Function called to determine whether the phase is finished
    this.terminalFunction = () => (false);

    return this;
  }

  // Updates or returns the current state
  state(updatedState) {
    if (updatedState === undefined) return this.phaseState;
    Object.keys(updatedState).forEach((key) => {
      this.phaseState[key] = updatedState[key];
    });
    return null;
  }

  initial(initial) {
    this.initialFunction = initial;
    return this;
  }

  next(transition) {
    this.transitionFunction = transition;
    return this;
  }

  end(terminal) {
    this.terminalFunction = terminal;
    return this;
  }

  updateTimestep(newValue) {
    this.timeStep = newValue;
    return this;
  }

  // Stop the phase's application but don't clear settings/state
  stop() {
    clearInterval(this.interval);
    return this;
  }

  // Reset the phase to its initial settings/state
  reset() {
    this.phaseState = {};

    Object.keys(this.morphs).forEach((morph) => {
      this.morphs[morph].destroy();
    });
    this.morphs = {};
    Object.keys(this.nodeGroups).forEach((nodeGroup) => {
      this.nodeGroups[nodeGroup].destroy();
    });
    this.nodeGroups = {};
    Object.keys(this.linkGroups).forEach((linkGroup) => {
      this.linkGroups[linkGroup].destroy();
    });
    this.linkGroups = {};
    return this;
  }

  // Teardown the phase along with its associated groups/morphs and remove from viz
  destroy() {
    Object.keys(this.morphs).forEach((morph) => {
      this.morphs[morph].destroy();
    });
    this.morphs = {};
    Object.keys(this.nodeGroups).forEach((nodeGroup) => {
      this.nodeGroups[nodeGroup].destroy();
    });
    this.nodeGroups = {};
    Object.keys(this.linkGroups).forEach((linkGroup) => {
      this.linkGroups[linkGroup].destroy();
    });
    this.linkGroups = {};

    delete this.network.phases[this.label];
  }

  step() {
    this.transitionFunction(this.state(), this.network.state());
    if (this.terminalFunction(this.state(), this.network.state())) this.stop();
  }

  // Begins the simulation
  start() {
    // TODO: Only initialize if the simulation has not been started yet or has been reset
    this.initialFunction(this.state(), this.network.state());
    this.step();
    this.interval = setInterval(this.step.bind(this), this.timeStep);
    return this;
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
