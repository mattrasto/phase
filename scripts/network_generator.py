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
    --directed, -d: boolean (optional, default: False)
        Whether the graph should have directed or undirected edges.
        Defaults to false (undirected).

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

args = None  # Global to store parsed CLI arguments

# Parses CLI arguments
def parse_input():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--nodes', type=int, required=True,
                        help='Number of nodes in network.')
    # TODO: Automatically determine best default edge density
    parser.add_argument('-ed', '--edge-density', dest='edge_density', type=float, default=.5,
                        help='Density from [0, 1] of edges to create. 0 means no edges, 1 means fully-connected graph.')
    parser.add_argument('-c', '--connected', type=ast.literal_eval, default=False,
                        help='Whether the graph should be connected or disconnected. If true and edge density is too low to create a connected graph, this argument will take precedent and a spanning tree will be generated.')
    parser.add_argument('-f', '--filename', type=str,
                        help='Name of output file.')
    parser.add_argument('-v', '--variable', type=str,
                        help='Name of variable the JSON will be assigned to in output file. Defaults to filename.')
    parser.add_argument('-d', '--directed', type=ast.literal_eval, default=False,
                        help='Whether the graph should have directed or undirected edges. Defaults to false (undirected).')
    global args
    args = parser.parse_args()

# Generator that returns a node with a random id and name
# NOTE: Hardcoded to support up to i*j*k (10*10*10 = 1000 for now) names
# TODO: Create a cartesian product of all sets and randomly sample when args.nodes !<< i*j*k for better performance
def generate_random_node():
    used_names = set()
    # Sets guarantee random ordering
    # Sizes: 16, 22, 26, 23, 21 (total possible names: 4,420,416)
    prefixes = {'', 'Dr.', 'Prof.', 'Atty.', 'Hon.', 'Col.', 'Capt.', 'Adm.', 'Gen.', 'Gov.', 'Mr.', 'Mrs.', 'Ms.', 'Rev.', 'Cmdr.', 'Chief'}
    first_names = {'Jack', 'John', 'Matt', 'Yath', 'Lee', 'David', 'Akshay', 'Amed', 'Sergei', 'Viktor', 'Jacob', 'Allison', 'Shirley', 'Megan', 'Caesar', 'Bonnie', 'Charlotte', 'Gabriel', 'Gabriela', 'Elena', 'Bryan', 'Aaron'}
    middle_initials = {'', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'}
    last_names = {'Smith', 'Johnson', 'Patel', 'Li', 'Cook', 'Tano', 'Yang', 'Hernandez', 'Bera', 'Sun', 'Jackson', 'Black', 'White', 'Goldberg', 'Tana', 'Akbarzadeh', 'Sneh', 'Caesar', 'Kaleoharis', 'Putin', 'Cohen', 'Terra', 'Stein'}
    suffixes = {'', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'Jr.', 'Sr.', 'CPA', 'DDS', 'Esq', 'JD', 'LLD', 'MD', 'PhD', 'RN'}
    while True:
        a = random.sample(prefixes, 1)[0]
        b = random.sample(first_names, 1)[0]
        c = random.sample(middle_initials, 1)[0]
        d = random.sample(last_names, 1)[0]
        e = random.sample(suffixes, 1)[0]
        name = a + ' ' + b + ' ' + c + '. ' + d + ' ' + e
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
        if source == target:
            continue
        id = source + '-' + target
        if id in used_ids:
            continue
        used_ids.add(id)
        if not args.directed:
            used_ids.add(target + '-' + source)
        yield {'source': source, 'target': target}

# Generates links that form a MST (basic connected graph) using a variation of Kruskal's algorithm
def generate_spanning_tree(network):
    forest = []  # List of sets representing trees within graph
    for node in network['nodes']:
        forest.append(set([node['id']]))

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
        # Add new union set and remove combined sets
        forest.append(forest[source_set_idx].union(forest[target_set_idx]))
        if source_set_idx < target_set_idx:
            target_set_idx -= 1
        forest.pop(source_set_idx)
        forest.pop(target_set_idx)
        # Add to used_ids to use in link generation after MST is formed
        id = link['source'] + '-' + link['target']
        used_ids.add(id)
        if not args.directed:
            used_ids.add(link['target'] + '-' + link['source'])
    return used_ids

# Creates the network object
def create_network():
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
    if args.directed:
        max_edges = args.nodes * (args.nodes - 1)
    else:
        max_edges = args.nodes * (args.nodes - 1) / 2
    while num_edges < math.floor(max_edges * args.edge_density):
        network['links'].append(next(random_link_gen))
        num_edges += 1

    return network

# Exports the network data to the specified filename or an argument-unique name
def export_network(args, network):
    filename = args.filename
    if filename == None:
        filename = '_'.join(str(arg) for arg in sys.argv[1:]).replace('-', '').replace('=', '-') + '.json'
    target_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../demos/data/generated/')
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    file_path = os.path.join(target_dir, filename)
    var_name = args.variable
    if var_name == None:
        var_name = filename.replace('.json', '')
    with open(file_path, 'w') as f:
        f.write('const ' + var_name + ' = ')
        json.dump(network, f, indent=2)

if __name__ == '__main__':
    parse_input()
    network = create_network()
    export_network(args, network)
