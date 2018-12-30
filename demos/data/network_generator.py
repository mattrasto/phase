'''Generates a network in d3-force-graph format based on user inputs

Args:
    --nodes, -n: integer (required)
        Number of nodes in network
    --edge-density, -ed: float [0, 1] (optional, default: .5)
        Density from [0, 1] of edges to create.
        0 means no edges, 1 means fully-connected graph.
    --connected, -c: boolean (optional, default: False)
        Whether the graph should be guaranteed to be connected.
        If true and edge density is too low to create a connected graph,
            this argument will take precedent and a MST will be generated.
    --filename, -f: string
        Name of output file

Returns:
    filename: .json file
        Creates a JSON file with the specified filename or an argument-unique name containing the network data:
        {
            'nodes': [{'id': ..., 'attr1': ...}, ...],
            'links': [{'source': id1, 'target': id2, 'attr1': ...}, ...],
        }
'''

import sys, os
import argparse
import json
from pprint import pprint


# Parses CLI arguments
def parse_input():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--nodes', type=int, required=True,
                        help='Number of nodes in network')
    parser.add_argument('-ed', '--edge-density', dest='edge_density', type=float, default=.5,
                        help='Density from [0, 1] of edges to create. 0 means no edges, 1 means fully-connected graph.')
    parser.add_argument('-c', '--connected', type=bool, default=False,
                        help='Whether the graph should be connected or disconnected. If true and edge density is too low to create a connected graph, this argument will take precedent and a MST will be generated.')
    parser.add_argument('-f', '--filename', type=str,
                        help='Name of output file')
    args = parser.parse_args()
    return args

# Generates a random node with an id and name
def generate_random_node():
    pass

# Generates a random link with an id and name
def generate_random_link():
    pass

# Creates the network object
def create_network(args):
    network = {'nodes': [], 'links': []}

    for i in range(args.nodes):
        network['nodes'].append({'id': '...', 'location': '...'})

    return network

# Exports the network data to the specified filename or an argument-unique name
def export_network(args, network):
    filename = args.filename
    if filename == None:
        filename = '_'.join(str(arg) for arg in sys.argv[1:]).replace('-', '').replace('=', '-') + '.json'
    with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), filename), 'w') as f:
        json.dump(network, f, indent=2)


if __name__ == '__main__':
    args = parse_input()
    network = create_network(args)
    export_network(args, network)
