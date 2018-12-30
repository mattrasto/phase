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
import random
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

# Generator that returns a node with a random id and name
# NOTE: Hardcoded to support up to 1000 names
# TODO: Create a cartesian product of all sets and randomly sample for better performance
def generate_random_node():
    used_names = set()
    # Sets guarantee random ordering
    first_names = {'Jack', 'John', 'Matt', 'Yath', 'Lee', 'David', 'Akshay', 'Amed', 'Sergei', 'Viktor'}
    middle_initials = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'}
    last_names = {'Smith', 'Johnson', 'Patel', 'Li', 'Cook', 'Tano', 'Yang', 'Hernandez', 'Bera', 'Sun'}
    while True:
        i = random.sample(first_names, 1)[0]
        j = random.sample(middle_initials, 1)[0]
        k = random.sample(last_names, 1)[0]
        name = i + ' ' + j + '. ' + k
        if name in used_names:
            continue
        id = name.lower().replace(' ', '_').replace('.', '')
        used_names.add(name)
        yield {'id': id, 'name': name}


# Generates a random link with an id and name
def generate_random_link(nodes):
    pass

# Creates the network object
def create_network(args):
    network = {'nodes': [], 'links': []}

    random_node_gen = generate_random_node()
    for i in range(args.nodes):
        network['nodes'].append(next(random_node_gen))

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
