import { select } from 'd3';
import { InvalidFiltererError } from './error';

const NODE_SELECTOR = 'circle';
const LINK_SELECTOR = 'line';

class Group {
  constructor(network, label, filterer, val, selector, parent) {
    this.network = network;
    this.label = label;
    this.filterer = filterer;
    this.val = val;
    this.selector = selector; // "circle" or "line"
    this.parent = parent;
    this.children = [];

    // Phase the group is associated with
    this.phase = null;

    if (this.parent) {
      this.createFilterer(filterer, val, this.parent.filterer);
      this.filterSelection(this.parent.selection);
    } else {
      this.createFilterer(filterer, val);
      this.filterSelection();
    }

    // Style history
    this.styles = {};

    // Event handlers associated with this group
    this.eventHandlers = {};

    return this;
  }

  reevaluate() {
    if (this.parent) {
      this.filterSelection(this.parent.selection);
    } else {
      this.filterSelection();
    }
    // Recursively reevaluate subgroups
    this.children.forEach(child => child.reevaluate());
    this.restyle();
  }

  // Creates a subgroup of the current group
  // If no filterer is passed, creates a copy of the current group
  subgroup(label, filterer, val) {
    const subfilterer = filterer === undefined ? '' : filterer;
    let child;
    if (this.selector === NODE_SELECTOR) {
      // eslint-disable-next-line no-use-before-define
      child = this.network.nodeGroup(label, subfilterer, val, this);
    } else {
      // eslint-disable-next-line no-use-before-define
      child = this.network.linkGroup(label, subfilterer, val, this);
    }
    this.children.push(child);
    return child;
  }

  // Adds an element to the group if it meets the group criteria
  addElement(d) {
    if (this.filterer(d)) {
      let sel;
      if (this.selector === NODE_SELECTOR) {
        // eslint-disable-next-line no-undef
        sel = document.querySelector(`g#phase-${this.network.label}-node-${d.id}`);
      } else {
        // eslint-disable-next-line no-undef
        sel = document.querySelector(`g#phase-${this.network.label}-link-${d.id}`);
      }
      this.selection._groups[0].push(sel); // eslint-disable-line no-underscore-dangle
    }
  }

  // Creates the selection by filtering the parent group's selection (if it exists) or all elements
  filterSelection(parentSelection) {
    const isNodeGroup = this.selector === NODE_SELECTOR;
    if (parentSelection !== undefined) {
      this.selection = parentSelection.filter(d => this.filterer(d));
    } else {
      const containers = isNodeGroup ? this.network.nodeContainers : this.network.linkContainers;
      this.selection = containers.filter(d => this.filterer(d));
    }
  }

  // TODO: evaluateMember() function for individual data entries (related to #24)

  // Creates the filter function used to assess element membership
  createFilterer(filterer, val, parentFilterer) {
    let subFilterer;
    if (typeof filterer === 'string') {
      subFilterer = d => (val === undefined ? true : d[filterer] === val);
    } else if (typeof filterer === 'function') {
      subFilterer = filterer;
    } else if (Array.isArray(filterer) || filterer instanceof Set) {
      const set = new Set(filterer);
      subFilterer = d => (set.has(d.id));
    } else {
      throw new InvalidFiltererError('Invalid filterer type');
    }

    if (parentFilterer !== undefined) {
      this.filterer = d => (subFilterer(d) && parentFilterer(d));
    } else {
      this.filterer = subFilterer;
    }
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
    return this;
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
    return this;
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
      // Reevaluate group on data update
      this.reevaluate();
    }
    return this;
  }

  event(eventName, func) {
    let func1 = func;
    if (func == null) {
      func1 = () => {};
    }
    const wrapperFunc = function wrapper(d) {
      // TODO: Modify stylemap
      func1.call(this, d, select(this.childNodes[0]), select(this.childNodes[1]));
    };

    this.selection.on(eventName, wrapperFunc);
    // TODO: If an element is reevaluated into multiple groups after being
    // added, which handler is it assigned?
    this.eventHandlers[eventName] = wrapperFunc;
    return this;
  }

  // TODO: If group belongs to a phase, this will not properly remove the reference
  destroy() {
    if (this.label in this.network.nodeGroups) {
      delete this.network.nodeGroups[this.label];
    } else if (this.label in this.network.linkGroups) {
      delete this.network.linkGroups[this.label];
    }
    if (this.phase) {
      if (this.phase.nodeGroups
          && this.label in this.phase.nodeGroups) {
        delete this.phase.nodeGroups[this.label];
      }
      if (this.phase.linkGroups
          && this.label in this.phase.linkGroups) {
        delete this.phase.linkGroups[this.label];
      }
    }
    if (this.children.length > 0) {
      this.children.forEach((child) => {
        child.parent = null; // eslint-disable-line no-param-reassign
      });
    }
    if (this.parent) {
      // eslint-disable-next-line arrow-body-style
      this.parent.children = this.parent.children.filter((child) => {
        return child.parent.label === this.label;
      });
    }
  }
} // End Group Class

export class NodeGroup extends Group {
  // Creates a node group based on attributes or a passed in selection
  constructor(network, label, filterer, val, parent = undefined) {
    super(network, label, filterer, val, NODE_SELECTOR, parent);
  }

  unstyle() {
    return super.style(this.network.defaultNodeStyles);
  }
} // End NodeGroup Class

export class LinkGroup extends Group {
  // Creates a link group based on attributes or a passed in selection
  constructor(network, label, filterer, val, parent = undefined) {
    super(network, label, filterer, val, LINK_SELECTOR, parent);
  }

  unstyle() {
    return super.style(this.network.defaultLinkStyles);
  }
} // End LinkGroup Class
