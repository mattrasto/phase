const NODE_SELECTOR = 'circle';
const LINK_SELECTOR = 'line';

class Group {
  constructor(network, label, filterer, val, selector, parent = undefined) {
    this.network = network;
    this.label = label;
    this.filterer = filterer;
    this.val = val;
    this.selector = selector; // "circle" or "line"
    this.parent = parent;

    // Phase the group is associated with
    this.phase = null;

    this.selection = this.filter(filterer, val);

    // Style history
    this.styles = {};

    // Event handlers associated with this group
    this.eventHandlers = {};

    return this;
  }

  subgroup(label, filterer, val) {
    return new Group(this.network, label, filterer, val, this.selector, this);
  }

  filter(filterer, val) {
    // TODO: Refactor to make clearer (perhaps remove options?)
    const isNodeGroup = this.selector === NODE_SELECTOR;
    let containers;
    if (this.parent !== undefined) {
      containers = this.parent.selection;
    } else {
      containers = isNodeGroup ? this.network.nodeContainers : this.network.linkContainers;
    }

    if (typeof filterer === 'string') {
      return val === undefined ? containers : containers.filter(d => d[filterer] === val);
    }
    if (typeof filterer === 'function') {
      return containers.filter(d => filterer(d));
    }
    if (Array.isArray(filterer) || filterer instanceof Set) {
      const set = new Set(filterer);
      if (isNodeGroup) {
        return containers.filter(d => set.has(d.id));
      }
      return containers.filter(d => set.has(d.source.id) || set.has(d.target.id));
    }
    throw Error('Invalid filterer type');
  }

  // Applies styles from the stylemap to the selection
  style(styleMap) {
    // Use foreach on styleMap
    Object.keys(styleMap).forEach((attr) => {
      this.styles[attr] = styleMap[attr];
      // Check for unsupported styles (eg. Firefox only supports 'r' as an attribute, not a style)
      if (['r'].includes(attr)) {
        this.selection.select(this.selector).attr(attr, styleMap[attr]);
      } else {
        this.selection.select(this.selector).style(attr, styleMap[attr]);
      }
    });
  }

  // Sets style history to an existing map when rebinding to new svg
  setStyle(styleMap) {
    this.styles = styleMap;
  }

  getStyle() {
    return this.styles;
  }

  restyle() {
    this.style(this.styles);
  }

  labels(labeler) {
    this.selection.select('text').text(labeler);
  }

  morph(morph) {
    if (morph.type === 'style') {
      this.style(morph.change);
    }
    if (morph.type === 'data') {
      const newData = this.selection.data();
      Object.keys(newData).forEach((datum) => {
        Object.keys(morph.change).forEach((update) => {
          newData[datum][update] = morph.change[update];
        });
      });
      this.selection.data(newData);
    }
  }

  event(eventName, func) {
    /* global d3 */
    let func1 = func;
    if (func == null) {
      func1 = () => {};
    }
    const wrapperFunc = function wrapper(d) {
      // TODO: Modify stylemap
      func1.call(this, d, d3.select(this.childNodes[0]), d3.select(this.childNodes[1]));
    };

    this.selection.on(eventName, wrapperFunc);
    // TODO: If an element is reevaluated into multiple groups after being
    // added, which handler is it assigned?
    this.eventHandlers[eventName] = wrapperFunc;
  }

  // TODO: If group belongs to a phase, this will not properly remove the reference
  destroy() {
    if (this.label in this.network.nodeGroups) {
      delete this.network.nodeGroups[this.label];
    } else if (this.label in this.network.linkGroups) {
      delete this.network.linkGroups[this.label];
    }
  }
} // End Group Class

export class NodeGroup extends Group {
  // Creates a node group based on attributes or a passed in selection
  constructor(network, label, filterer, val) {
    super(network, label, filterer, val, NODE_SELECTOR);
  }

  unstyle() {
    super.style(this.network.defaultNodeStyles);
  }
} // End NodeGroup Class

export class LinkGroup extends Group {
  // Creates a link group based on attributes or a passed in selection
  constructor(network, label, filterer, val) {
    super(network, label, filterer, val, LINK_SELECTOR);
  }

  unstyle() {
    super.style(this.network.defaultLinkStyles);
  }
} // End LinkGroup Class
