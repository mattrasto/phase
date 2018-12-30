'''Generates a network in d3-force-graph format based on user inputs

Args:
    --nodes, -n: integer (required)
        Number of nodes in network
    --edge-density, -ed: float [0, 1] (optional, default: .5)
        Density from [0, 1] of edges to create.
        0 means no edges, 1 means fully-connected graph.
    --connected, -c: boolean (optional, default: False)
        Whether the graph should be connected or disconnected.
        If true and edge density is too low to create a connected graph,
            this argument will take precedent and a MST will be generated.

Returns:
    network: nested dict in d3-force-graph format
        {
            'nodes': [{'id': ..., 'attr1': ...}, ...],
            'links': [{'source': id1, 'target': id2, 'attr1': ...}, ...],
        }
'''

import sys
import argparse
from pprint import pprint


def parse_input(input):
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--nodes', type=int, required=True,
                        help='Number of nodes in network')
    parser.add_argument('-ed', '--edge-density', dest='edge_density', type=float, default=.5,
                        help='Density from [0, 1] of edges to create. 0 means no edges, 1 means fully-connected graph.')
    parser.add_argument('-c', '--connected', type=bool, default=False,
                        help='Whether the graph should be connected or disconnected. If true and edge density is too low to create a connected graph, this argument will take precedent and a MST will be generated.')
    args = parser.parse_args()
    return args

def create_network(args):
    print(args)



if __name__ == '__main__':
    args = parse_input(sys.argv)
    create_network(args)
