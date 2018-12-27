const NODE_SELECTOR = "circle";
const LINK_SELECTOR = "line";

class Group {
    constructor(network, label, filterer, val, selector) {

        this._network = network;
        this.label = label;
        this._filterer = filterer;
        this._val = val;
        this.selector = selector; // "circle" or "line"

        // Phase the group is associated with
        this.phase;

        this._selection = this._filter(filterer, val);

        // Style history
        this._styles = {};

        // Event handlers associated with this group
        this._eventHandlers = {};

        return this;
    }

    _filter(filterer, val) {
        const isNodeGroup = this.selector === NODE_SELECTOR;
        const containers = isNodeGroup ? this._network._nodeContainers : this._network._linkContainers;

        if (typeof filterer === "string") {
            return val === undefined ? containers : containers.filter(d => d[filterer] == val);
        }
        else if (typeof filterer === "function") {
            return containers.filter(d => filterer(d));
        }
        else if (Array.isArray(filterer) || filterer instanceof Set) {
            const set = new Set(filterer)
            if (isNodeGroup) {
                return containers.filter(d => set.has(d.id))
            } else {
                return containers.filter(d => set.has(d.source.id) || set.has(d.target.id))
            }
        }
        else {
            throw new InvalidFilterException("Invalid filterer type");
        }
    }

    // Applies styles from the stylemap to the selection
    style(styleMap) {
        for (const attr in styleMap) {
            this._styles[attr] = styleMap[attr];
            this._selection.select(this.selector).style(attr, styleMap[attr]);
        }
    }

    // Sets style history to an existing map when rebinding to new svg
    setStyle(styleMap){
        this._styles = styleMap;
    }

    getStyle(){
        return this._styles;
    }

    restyle(){
        this.style(this._styles);
    }

    labels(labeler) {
        this._selection.select("text").text(labeler);
    }

    morph(label) {
        const morph = this.phase ? this._network.getPhase(this.phase).getMorph(label) : this._network.getMorph(label);
        if (morph._type == "style") {
            this.style(morph._change);
        }
        if (morph._type == "data") {
            let newData = this._selection.data();
            for (const datum in newData) {
                for (const update in morph._change) {
                    newData[datum][update] = morph._change[update];
                }
            }
            this._selection.data(newData);
        }
    }

    event(eventName, func) {
        if (func == null) {
            func = () => {};
        }
        let wrapperFunc = function(d) {
            // TODO: Modify stylemap
            func.call(this, d, d3.select(this.childNodes[0]), d3.select(this.childNodes[1]));
        }

        this._selection.on(eventName, wrapperFunc);
        // TODO: If an element is reevaluated into multiple groups after being added, which handler is it assigned?
        this._eventHandlers[eventName] = wrapperFunc;
    }

    destroy() {
        if (this.label in this._network._nodeGroups) {
            delete this._network._nodeGroups[this.label];
        }
        else if (this.label in this._network._linkGroups) {
            delete this._network._linkGroups[this.label];
        }
    }
} // End Group Class

export class NodeGroup extends Group {
    // Creates a node group based on attributes or a passed in selection
    constructor(network, label, filterer, val) {
        super(network, label, filterer, val, NODE_SELECTOR);
    }

    unstyle() {
        super.style(this._network._defaultNodeStyles);
    }
} // End NodeGroup Class

export class LinkGroup extends Group {
    // Creates a link group based on attributes or a passed in selection
    constructor(network, label, filterer, val) {
        super(network, label, filterer, val, LINK_SELECTOR);
    }

    unstyle() {
        super.style(this._network._defaultLinkStyles);
    }
} // End LinkGroup Class
