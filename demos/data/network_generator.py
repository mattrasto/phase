'''Generates an undirected graph in d3-force-graph format based on user inputs

Args:
    --nodes, -n: integer (required)
        Number of nodes in network.
    --edge-density, -ed: float [0, 1] (optional, default: .5)
        Density from [0, 1] of edges to create.
        0 means no edges, 1 means fully-connected graph.
    --connected, -c: boolean (optional, default: False)
        Whether the graph should be guaranteed to be connected.
        If true and edge density is too low to create a connected graph,
            this argument will take precedent and a MST will be generated.
    --filename, -f: string
        Name of output file.
    --variable, -v: string
        Name of variable the JSON will be assigned to in output file.
        Defaults to filename.

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
import math
import ast
from pprint import pprint


# Parses CLI arguments
# TODO: Add -d/--directed argument
def parse_input():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--nodes', type=int, required=True,
                        help='Number of nodes in network.')
    # TODO: Automatically determine best default edge density
    parser.add_argument('-ed', '--edge-density', dest='edge_density', type=float, default=.5,
                        help='Density from [0, 1] of edges to create. 0 means no edges, 1 means fully-connected graph.')
    parser.add_argument('-c', '--connected', type=ast.literal_eval, default=False,
                        help='Whether the graph should be connected or disconnected. If true and edge density is too low to create a connected graph, this argument will take precedent and a MST will be generated.')
    parser.add_argument('-f', '--filename', type=str,
                        help='Name of output file.')
    parser.add_argument('-v', '--variable', type=str,
                        help='Name of variable the JSON will be assigned to in output file. Defaults to filename.')
    args = parser.parse_args()
    return args

# Generator that returns a node with a random id and name
# NOTE: Hardcoded to support up to i*j*k (10*10*10 = 1000 for now) names
# TODO: Create a cartesian product of all sets and randomly sample when args.nodes !<< i*j*k for better performance
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

# Generates a random link with a source and target
def generate_random_link(nodes, used_ids):
    while True:
        source = random.choice(nodes)['id']
        target = random.choice(nodes)['id']
        id = source + '-' + target
        reverse_id = target + '-' + source
        if id in used_ids:
            continue
        used_ids.add(id)
        used_ids.add(reverse_id)
        yield {'source': source, 'target': target}

# Generates links that form a MST (basic connected graph) using a variation of Kruskal's algorithm
def generate_spanning_tree(network):
    forest = []  # List of sets representing trees within graph
    for node in network['nodes']:
        forest.append(set([node['id']]))
    # print(forest)

    used_ids = set()
    random_link_gen = generate_random_link(network['nodes'], set())
    while len(forest) > 1:
        link = next(random_link_gen)
        # NOTE: This could be optimized using a dictionary with references to vertex sets
        cycle = False
        source_set_idx = -1
        target_set_idx = -1
        i = 0
        while source_set_idx < 0 or target_set_idx < 0:
            if link['source'] in forest[i]:
                source_set_idx = i
            if link['target'] in forest[i]:
                target_set_idx = i
            i += 1
        # If source and target belong to same set, link creates a cycle
        if source_set_idx == target_set_idx:
            continue
        network['links'].append(link)
        forest.append(forest[source_set_idx].union(forest[target_set_idx]))
        if source_set_idx < target_set_idx:
            target_set_idx -= 1
        forest.pop(source_set_idx)
        forest.pop(target_set_idx)
        # Add to used_ids to use in link generation after MST is formed
        id = link['source'] + '-' + link['target']
        reverse_id = link['target'] + '-' + link['source']
        used_ids.add(id)
        used_ids.add(reverse_id)
    return used_ids

# Creates the network object
def create_network(args):
    network = {'nodes': [], 'links': []}

    random_node_gen = generate_random_node()
    for i in range(args.nodes):
        network['nodes'].append(next(random_node_gen))

    if args.connected:
        used_link_ids = generate_spanning_tree(network)
        num_edges = args.nodes - 1
    else:
        used_link_ids = set()
        num_edges = 0

    random_link_gen = generate_random_link(network['nodes'], used_link_ids)
    while num_edges < math.floor(args.nodes * (args.nodes - 1) / 2 * args.edge_density):
        network['links'].append(next(random_link_gen))
        num_edges += 1

    return network

# Exports the network data to the specified filename or an argument-unique name
def export_network(args, network):
    filename = args.filename
    if filename == None:
        filename = '_'.join(str(arg) for arg in sys.argv[1:]).replace('-', '').replace('=', '-') + '.json'
    file_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), filename)
    var_name = args.variable
    if var_name == None:
        var_name = filename.replace('.json', '')
    with open(file_path, 'w') as f:
        f.write('const ' + var_name + ' = ')
        json.dump(network, f, indent=2)



if __name__ == '__main__':
    args = parse_input()
    network = create_network(args)
    export_network(args, network)
