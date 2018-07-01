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

**Element Group**

Element groups are, quite simply, collections of elements; that is, nodes or links. The group can be updated in the same way that individual elements can in vanilla D3 - you can modify the data or styles of any group, and it will change all elements belonging to that group.

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

Well, that's almost true. Element groups can also be accessed in morphs and modified en masse. This combination allows you to make multiple nodes react to an event with minimal code.

**Phase**

A phase is another concept specific to this library. It represents a series of morphs in the graph that are executed in a specific ordering. Phases contain a whole simulation event - they chain together morphs to show the progression of a simulation event as it happens.

Let's take the previous example we used to explain morphs. Now, instead of just highlighting the link, let's say we want to also highlight the nodes. We would create two morphs: one for highlighting a node, and one for highlighting a link. Then we create a phase that uses these morphs to highlight them all at once. That's cool, but we could write that ourselves. What's cool about phases is that you can specify when and how these morphs are applied. Maybe we want to highlight the source node first, then highlight the link a second later, then highlight the target node another second later. This is easy with phases, and it's not much harder for more complex interactions.

If you're still not convinced on phases and morphs, check out the section on them below.

### Element Grouping

Element grouping allows you to combine elements together in collections that operate as a single unit. After creating a group of nodes or links, you can call the same functions as you would on a D3 object to modify that object.

Groups can overlap, in which case modifications are applied sequentially if they modify the element in similar ways.

Groups can be used in morphs as well. If a morph needs to mutate many elements in the same way, it makes sense to group them together and perform one operation on the entire set! This also helps for when the graph structure changes. If an element is added or removed from the group, that's no problem for the morph - it just keeps working on whichever elements are in that group.

Combining groups with events and morphs allow you to do one more thing: you can have two separate flows that simultaneously interact with the viz. You can modify the group whenever you want, and you can apply the morph whenever you want. So if you decided to apply the morph when the group changes (or vice versa), you can visualize a graph that adapts when its structure is changed!

### Events

In this section, "events" refers to Javascript events. Phase uses events as one way to manage phases using groups and to modify groups during the operation of a phase. Groups, phases, and morphs emit lifecycle events that any other operation can listen for and handle.

#### Provided Events

Here are the lifecycle events we provide:

##### Graph

`data`

Any data-modifying operation is performed on the graph object. If data was added, removed, or updated, this event will be emitted. However, if the methods are called but the data is not changed in any way, the event will not be emitted.

`data_add`

New data is introduced to the visualization. This event will be emitted if, when joined with new data, the data's `.enter()` set is not empty.

`data_remove`

Data is removed from the visualization. This event will be emitted if, when joined with new data, the data's `.exit()` set is not empty.

`data_update`

Any datum is updated in any capacity. This event will be emitted if the new data contains a datum with the same ID as an existing datum.

##### Element Group

`group_member`

Any member of the group has been added, removed, or had its style or data modified.

`group_member_add`

The group received a new member element.

`group_member_remove`

A member element was removed from the group.

`group_update`

A member element was updated by having its style or data changed.

`group_update_style`

A member element was updated by having its style changed.

`group_update_data`

A member element was updated by having its data changed.

##### Phase

`phase_start`

The phase's first morph is ready to be executed.

`phase_next`

The phase finished applying its current round of morphs in the execution tree and is ready to execute the next.

`phase_end`

The phase finished the last morph in its execution tree.

##### Morph

`morph_start`

The morph is beginning to apply its operations.

`morph_end`

The morph's operations are finished.

#### Example

Let's say you have a social network graph that contains two types of edges: "friends" and "friends of friends". When a person friends another, you want the following to happen in order:

1. The link between the newly friended nodes changes to a "friends" link.
2. A glowing effect travels from the source node to the target node, then divides and travels along the links of new friends of friends.
3. When the glowing effect reaches the nodes representing new friends of friends, you want the links to change and be added to the "friends of friends" links group.

Sounds like a lot, but it's not too bad. Let's break down how we could do this, assuming we've already created groups for "friends" and "friends of friends":

1. When a new friendship is formed, find the link between the nodes and switch it from the "friends of friends" group to the "friends" group.
2. Create a phase with a single morph: the glowing effect traveling from one node to another.
3. Queue the morph from source node to target node, then queue parallel morphs over all other links connected to each node but not shared between them.
4. Add all new "friends of friends" links to the right group.

If we didn't use events, this could get tricky and needlessly complex. But we know we have some lifecycle methods that we can use:

1. When the "friends" group receives a new member, it will emit the `data` and `data_add` events. We can attach the glowing effect phase to run when the `data_add` event is emitted.
2. When the phase is finished, it will emit the `phase_end` event. We can attach a listener to the "friends of friends" group so that when the phase ends and emits the event we can add all new links to the group.

With just two element groups, one single-morph phase, and two event listeners, we can create highly dynamic graph changes _and see them happen in realtime_. These can easily be extended to support more complex interactions, all with the same pattern.

### Phases and Morphs

## Demos

Check out one of the demos in the `demos/` folder. They're completely self-contained, so you can open the `.html` file in a browser and start playing around.

## Contributing

If you think a feature is missing, have a suggestion, or find a bug, *please* make an issue.

I'm glad to accept any improvements, especially if they reference a specific issue.

If you'd like to get involved on a more active level, I'd love to chat at matthewrastovac@gmail.com.
