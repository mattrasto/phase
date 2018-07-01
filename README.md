# Phase

Phase is a graph visualization network built on top of D3 to allow quicker and more interactive network prototyping.

Phase was built with a simple philosophy: enable the creation of dynamic graph visualizations that support real-time events and responsive designs with as little extra code as possible. To do this, Phase introduces a few features:

1. Create groups of nodes or links that can be easily modified or styled together
2. Attach functions to events on the graph that modify the graph structure or display
3. Create phases, which simulate network events, that can be replayed and adapt to the graph structure over time

With these three features, Phase aims to tackle common visualization problems present in the study of networks and simulations. The goal is to reduce complex, dynamic systems to understandable representations.

## Concepts

### Terminology

There is some terminology in the library taken from (and sometimes conflicting with) concepts in complex systems science, so here's a quick primer on the important stuff.

**Graph**

A collection of nodes linked together by edges.

**Network**

In this library, used interchangeably with graph.

**Mutation**

A mutation is any change to the graph. This could be adding, deleting, or modifying any element or group of elements.

**Event**

Not to be confused with Javascript events, these are a series of actions applied to a network. For example, in a social network simulation, an event might be the transmittance of a message between friends - it travels from one node to other nodes across links, and it can further travel to friends of friends.

Context is important when discussing events, as we will need to refer to Javascript events alongside simulation events. Javascript events are a programming construct, but graph/network events are an abstract concept. I will try my best to disambiguate this in the documentation.

**Agent**

This term isn't used very often in this library, but it's worth mentioning as it may be used when explaining examples. An "agent" is a single object (usually a node) in a network, particular during a simulation, that acts individually. Typically agents are used in agent-based models to study the coordination of many individual actors working in the same environment. For example, in a simulation of a cohabitation process where nodes are organisms and edges could be, say, food relationships (prey, predator, neither, or both), each organism would be an agent.

**Morph**

A morph is a concept specific to this library. Morphs are mutations on the graph that affect the graph's structure, state, display, or any combination of the three. A morph can add, delete, or modify nodes, links, or groups. When modifying an element or group, it can affect the attributes, data, or styling of that element or group.

To understand morphs, take the example of a network of friends where you want to visualize a payment between two members. Let's assume the two nodes and a link between them already exists. The morph would be an action that, when applied, highlights the link between the nodes. It is singular and modifies only one element - the link between the nodes.

**Phase**

A phase is another concept specific to this library. It represents a series of morphs in the graph that are executed in a specific ordering. Phases contain a whole simulation event - they chain together morphs to show the progression of a simulation event as it happens.

Let's take the previous example we used to explain morphs. Now, instead of just highlighting the link, let's say we want to also highlight the nodes. We would create two morphs: one for highlighting a node, and one for highlighting a link. Then we create a phase that uses these morphs to highlight them all at once. That's cool, but we could write that ourselves. What's cool about phases is that you can specify when and how these morphs are applied. Maybe we want to highlight the source node first, then highlight the link a second later, then highlight the target node another second later. This is easy with phases, and it's not much harder for more complex interactions.

If you're still not convinced on phases and morphs, check out the section on them below.

### Node Grouping

### Events

### Phases and Morphs

## Demos

Check out one of the demos in the `demos/` folder. They're completely self-contained, so you can open the `.html` file in a browser.

## Contributing

If you think a feature is missing, have a suggestion, or find a bug, *please* make an issue.

I'm glad to accept any improvements, especially if they reference a specific issue.

 If you'd like to get involved on a more active level, I'd love to chat at matthewrastovac@gmail.com.
