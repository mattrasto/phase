# Phase

Current Version: 0.8.0 (Stable Beta)

Phase is a graph visualization network built on top of D3 to allow quicker and more interactive network prototyping.

![Alt Text](https://media.giphy.com/media/3E2Pk59lFflh1WWt0t/giphy.gif)

Phase was built with a simple philosophy: enable the creation of dynamic graph visualizations that support real-time events and responsive designs with as little extra code as possible. To do this, Phase introduces a few features:

1. Create groups of nodes or links that can be easily modified or styled together
2. Attach functions to events on the graph that modify the graph structure or display
3. Create phases, which simulate network events, that can be applied to multiple sets of elements simultaneously and adapt to the graph structure over time

With these three features, Phase aims to tackle common visualization problems present in the study of networks and simulations. The goal is to reduce complex, dynamic systems to understandable representations.

## Concepts

### Terminology

There is some terminology in the library taken from (and sometimes conflicting with) concepts in complex systems science, so here's a quick primer on the important stuff.

**Graph**

A collection of nodes linked together by edges.

**Network**

In this library, used interchangeably with graph.

**Graph Structure**

The graph structure refers to the elements (nodes and links) present in the graph and their relationship to each other.

**Element Group**

Element groups are, quite simply, collections of elements; that is, nodes or links. The group can be updated in the same way that individual elements can in vanilla D3 - you can modify the data or styles of any group, and it will change all elements belonging to that group.

**Mutation**

A mutation is any change to the graph. This could be adding, deleting, or modifying any element or group of elements.

**Event**

Not to be confused with Javascript events, these are a series of actions applied to a network. For example, in a social network simulation, an event might be the transmission of a message between friends - it travels from one node to other nodes across links, and it can further travel to friends of friends.

Context is important when discussing events, as we will need to refer to Javascript events alongside simulation events. Javascript events are a programming construct, but graph/network events are an abstract concept. I will try my best to disambiguate this in the documentation.

**Agent**

This term isn't used very often in this library, but it's worth mentioning as it may be used when explaining examples. An "agent" is a single object (usually a node) in a network, particularly during a simulation, that acts individually. Typically agents are used in agent-based models to study the coordination of many individual actors working in the same environment. For example, in a simulation of a cohabitation process where nodes are organisms and edges could be, say, food relationships (prey, predator, neither, or both), each organism would be an agent.

**Morph**

A morph is a concept specific to this library. Morphs are mutations on the graph that affect the graph's structure, state, display, or any combination of the three. A morph can add, delete, or modify nodes, links, or groups. When modifying an element or group, it can affect the attributes, data, or styling of that element or group.

To understand morphs, take the example of a network of friends where you want to visualize a payment between two members. Let's assume the two nodes and a link between them already exists. The morph would be an action that, when applied, highlights the link between the nodes. It is singular and modifies only one element - the link between the nodes.

Well, that's almost true. Element groups can also be accessed in morphs and modified en masse. This combination allows you to have multiple nodes react to an event with minimal code.

**Phase**

A phase is another concept specific to this library. It represents a series of morphs in the graph that are executed in a specific order. Phases contain a whole simulation event - they chain together morphs to show the progression of a simulated network event as it happens.

Let's take the previous example we used to explain morphs. Now, instead of just highlighting the link, let's say we want to also highlight the nodes. We would create two morphs: one for highlighting a node, and one for highlighting a link. Then we create a phase that uses these morphs to highlight them all at once. That's cool, but we could write that ourselves. What's cool about phases is that you can specify when and how these morphs are applied. Maybe we want to highlight the source node first, then highlight the link a second later, then highlight the target node another second later. This is easy with phases, and it's not much harder for more complex interactions.

If you're still not convinced on phases and morphs, check out the section on them below.

### Element Grouping

Element grouping allows you to combine elements together in collections that operate as a single unit. After creating a group of nodes or links, you can call the same functions as you would on a D3 object to modify that object.

Groups can overlap, in which case modifications are applied sequentially if they modify the same attributes of an element.

Groups can be used in morphs as well. If a morph needs to mutate many elements in the same way, it makes sense to group them together and perform one operation on the entire set! This also helps for when the graph structure changes. If an element is added or removed from the group, that's no problem for the morph - it just keeps working on whichever elements are in that group whenever it's applied.

Combining groups with events and morphs allow you to do one more thing: you can have two separate flows that simultaneously interact with the viz. You can modify the group whenever you want, and you can apply the morph whenever you want. So if you decided to apply the morph when the group changes (or vice versa), you can visualize a graph that adapts when its structure is changed!

### Events (In Development)

In this section, "events" refers to Javascript events. Phase uses events as one way to manage phases using groups and to modify groups during the operation of a phase. Groups, phases, and morphs emit lifecycle events that any other operation can listen for and handle.

#### Provided Events

Here are the lifecycle events we provide by default:

##### Graph

`tick`

The elements in the visualization are repositioned in the graph. This occurs very often (every few milliseconds), so it's *highly* discouraged to have computationally expensive operations listen to this event.

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

##### Morph

`morph_start`

The morph is beginning to apply its operations.

`morph_end`

The morph's operations are finished.

`morph_error`

The morph failed to apply its operations.

##### Phase

`phase_start`

The phase's first morph is ready to be executed.

`phase_next`

The phase finished applying its current round of morphs in the execution tree and is ready to execute the next.

`phase_end`

The phase finished the last morph in its execution tree.

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

Phases and morphs are probably the hardest concepts to grasp. I'll explain the motivation behind phases and morphs before we dive into how they work.

#### Motivation

I want to build large-scale social simulations. But social networks are complex, with a potentially infinite number of events that can occur between nodes, sometimes simultaneously and sometimes interacting with each other. For example, a person messaging a friend is an event. A person posting a status is also an event. These two events are somewhat distinct - they have multiple working parts that effect the structure of the graph in different ways, and they can also happen simultaneously. We could code each individual mutation of each event separately, but many times the mutations are reusable and/or must be executed in a certain order. Additionally, when two events operate on the same nodes, how they're supposed to interact is unclear unless we have the context that a phase provides.

#### What is a Morph?

![Alt Text](https://media.giphy.com/media/8vvW3kBTCJjp8rjrz7/giphy.gif)

Before we can fully understand phases, we have to understand morphs. Morphs are single-element mutations on the graph. A morph can edit data or styling of an element as well as add or remove data from the graph. That's it - four things. If you want to add a node, remove an edge, highlight a node, or change the style of a link, all you need is a morph.

Morphs can also act on element groups. Yes, the point of a morph is that it modifies _only one_ element, but element groups act as a single element anyway. You can modify every node in the graph with a single morph. You can also delete an entire element group with a morph. However, you can't add a group of nodes, since it won't exist before you add it to the graph.

Morphs are the building blocks of phases. For multi-step visualization events, you can intelligently chain together morphs in a phase.

#### What is a Phase?

![Alt Text](https://media.giphy.com/media/KVVfxA3I8cnw5tHnyd/giphy.gif)

A phase represent an event's effect on the graph - it encapsulates multiple morphs and applies them in a specific order dictated by the user. It also maintains properties that affect the application of the morphs as well as the state of the graph during the process. This allows phases to communicate with each other by sharing their settings and state.

It's important to note that "settings" and "state" are not like the properties and state used in other libraries (eg. React). Both are mutable, and the difference is more semantic than functional: **settings control the operation of the phase**, whereas **state keeps track of the graph structure and other phase-specific data that describes (and is sometimes used in) the operation of the phase**. If you're still confused, take a look at the examples of settings and state below.

#### How Does a Phase Work?

Now that we know the why and the what, let's tackle the tough part: how. Phases have settings that affect their operation, such as how frequently morphs are applied in succession or how the phase should interact if there's a phase conflict. They also contain state, which is used to track the progress of the phase among other things.

Phases have three parts: the initialization step, the transitions, and the termination conditions. In the initialization step, we initialize any state variables and create any persistent variables we want to use in the phase during its transitions. A phase transition occurs when the phase progresses a single step: the transition function is evaluated, applying morphs and modifying state as needed. After the transition function is applied, the terminal conditions are checked by evaluating the termination function - if it returns true, the phase is stopped.

Phases don't need to applied just once. At any time, a phase can be reset to its initial state. You can also progress through the phase's steps individually instead of having each transition applied automatically. Phases can be reused on the graph until they are destroyed. Phases were designed to describe events on a graph, so they should be able to be applied to the graph regardless of the graph's structure.

#### Phase conflicts

When a phase conflicts with another phase (which occurs when an element is accessed by more than one phase transition at once), regardless of whether the shared elements are currently being morphed, an event `phase_conflict` will be emitted containing the state of both phases. Each phase is able to handle what happens when this occurs, whether that means pausing one phase until the conflict is resolved, destroying one phase, or something else - it's entirely customizable.

## Demos

Check out one of the demos in the `demos/` folder. They're completely self-contained, so you can open the `.html` file in a browser and start playing around.

## Contributing

If you think a feature is missing, have a suggestion, or find a bug, *please* make an issue!

I'm glad to accept any improvements, especially if they reference a specific issue.

If you'd like to get involved on a more active level, I'd love to chat at matthewrastovac@gmail.com
