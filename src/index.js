import Network from './network';
import { NodeGroup, LinkGroup } from './group';
import Morph from './morph';
import Phase from './phase';

export {
  Network,
  NodeGroup,
  LinkGroup,
  Morph,
  Phase,
};

/* global window */

/* Attach to global window for CDN version */
if (typeof window !== 'undefined') { // eslint-disable-line no-undef
  window.phase = { // eslint-disable-line no-undef
    Network(label, query, settings) {
      return new Network(label, query, settings);
    },
  };
}
