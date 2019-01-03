# Phase

Current Version: 0.8.0 (Stable Beta)

Phase is a graph visualization network built on top of D3 to allow quicker and more interactive network prototyping.

![Phase of BFS with multiple start nodes](https://imgur.com/4dVAg09.gif)

Phase was built with a simple philosophy: enable the creation of dynamic graph visualizations that support real-time events and responsive designs with as little extra code as possible. To do this, Phase introduces a few features:

1. Create groups of nodes or links that can be modified or styled together and adapt to the graph structure
2. Apply morphs to the graph that modify the graph structure or display
3. Create phases, which simulate network events, that can be applied to multiple sets of elements simultaneously and adapt to the graph structure over time

With these three features, Phase aims to tackle common visualization problems present in the study of networks and simulations. The goal is to reduce complex, dynamic systems to understandable representations.

To jump right in, check out [Getting Started](#Getting-Started)

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

Context is important when discussing events, as we will need to refer to Javascript events alongside simulation events. Javascript events are a programming construct, but graph/network events are an abstract concept.

**Agent**

This term isn't used very often in this library, but it's worth mentioning as it may be used when explaining examples. An "agent" is a single object (usually a node) in a network, particularly during a simulation, that acts individually. Typically agents are used in agent-based models to study the coordination of many individual actors working in the same environment. For example, in a simulation of a cohabitation process where nodes are organisms and edges could be, say, food relationships (prey, predator, neither, or both), each organism would be an agent.

**Morph**

A morph is a concept specific to this library. Morphs are mutations on the graph that affect the graph's structure, state, display, or any combination of the three. A morph can add, delete, or modify nodes, links, or groups. When modifying an element or group, it can affect the attributes, data, or styling of that element or group.

To understand morphs, take the example of a network of friends where you want to visualize a payment between two members. Let's assume the two nodes and a link between them already exists. The morph would be an action that, when applied, highlights the link between the nodes. It is singular and modifies only one element - the link between the nodes.

Well, that's almost true. Element groups can also be accessed in morphs and modified en masse. This combination allows you to have multiple nodes react to an event with minimal code.

**Phase**

A phase is another concept specific to this library. It represents a series of morphs in the graph that are executed in a specific order. Phases contain a whole simulation event - they chain together morphs to show the progression of a simulated network event as it happens.

Let's take the previous example we used to explain morphs. Now, instead of just highlighting the link, let's say we want to also highlight the nodes. We would create two morphs: one for highlighting a node, and one for highlighting a link. Then we create a phase that uses these morphs to highlight them all at once. That's cool, but we could write that ourselves. What's nice about phases is that you can specify when and how these morphs are applied. Maybe we want to highlight the source node first, then highlight the link a second later, then highlight the target node another second later. This is easy with phases, and it's not much harder for more complex interactions.

If you're still not convinced on phases and morphs, check out the section on them below.

### Element Grouping

![Colored node groups](https://imgur.com/CyrFFIf.jpg)

Element grouping allows you to combine elements together in collections that operate as a single unit. After creating a group of nodes or links, you can call the same functions as you would on a D3 object to modify that object.

Groups can overlap, in which case modifications are applied sequentially if they modify the same attributes of an element.

Groups can be used in morphs as well. If a morph needs to mutate many elements in the same way, it makes sense to group them together and perform one operation on the entire set. This also helps for when the graph structure changes. If an element is added or removed from the group, that's no problem for the morph - it just keeps working on whichever elements are in that group whenever it's applied.

Combining groups with events and morphs allow you to do another thing: you can have two separate flows that simultaneously interact with the viz. You can modify the group whenever you want, and you can apply the morph whenever you want. So if you decided to apply the morph when the group changes (or vice versa), you can visualize a graph that adapts when its structure is changed!

### Phases and Morphs

I'll explain the motivation behind phases and morphs before we dive into how they work.

#### Motivation

I want to build large-scale social simulations. But social networks are complex, with a potentially infinite number of events that can occur between nodes, sometimes simultaneously and sometimes interacting with each other. For example, a person messaging a friend is an event. A person posting a status is also an event. These two events are somewhat distinct - they have multiple working parts that effect the structure of the graph in different ways, and they can also happen simultaneously. We could code each individual mutation of each event separately, but many times the mutations are reusable and/or must be executed in a certain order. Additionally, when two events operate on the same nodes, how they're supposed to interact is unclear unless we have the context that a phase provides.

#### What is a Morph?

![Basic morphs](https://imgur.com/y3b2MLj.gif)

Before we can fully understand phases, we have to understand morphs. Morphs are single-element mutations on the graph. A morph can edit data or styling of an element as well as add or remove data from the graph. That's it - four things. If you want to add a node, remove an edge, highlight a node, or change the style of a link, all you need is a morph.

Morphs can also act on element groups. Yes, the point of a morph is that it modifies _only one_ element, but element groups act as a single element anyway. You can modify every node in the graph with a single morph. You can also delete an entire element group with a morph. However, you can't add a group of nodes, since it won't exist before you add it to the graph.

Morphs are the building blocks of phases. For multi-step visualization events, you can intelligently chain together morphs in a phase.

#### What is a Phase?

![Basic serial phase](https://imgur.com/l736R5u.gif)

A phase represent an event's effect on the graph - it encapsulates multiple morphs and applies them in a specific order dictated by the user. It also maintains properties that affect the application of the morphs as well as the state of the graph during the process. This allows phases to communicate with each other by sharing their settings and state.

It's important to note that "settings" and "state" are not like the properties and state used in other libraries (eg. React). Both are mutable, and the difference is more semantic than functional: **settings control the operation of the phase**, whereas **state keeps track of the graph structure and other phase-specific data that describes (and is sometimes used in) the operation of the phase**. If you're still confused, take a look at the examples of settings and state below.

#### How Does a Phase Work?

Now that we know the why and the what, let's tackle the tough part: how. Phases have settings that affect their operation, such as how frequently morphs are applied in succession or how the phase should interact if there's a phase conflict. They also contain state, which is used to track the progress of the phase among other things.

Phases have three parts: the initialization step, the transitions, and the termination conditions. In the initialization step, we initialize any state variables and create any persistent variables we want to use in the phase during its transitions. A phase transition occurs when the phase progresses a single step: the transition function is evaluated, applying morphs and modifying state as needed. After the transition function is applied, the terminal conditions are checked by evaluating the termination function - if it returns true, the phase is stopped.

Phases don't need to applied just once. At any time, a phase can be reset to its initial state. You can also progress through the phase's steps individually instead of having each transition applied automatically. Phases can be reused on the graph until they are destroyed. Phases were designed to describe events on a graph, so they should be able to be applied to the graph regardless of the graph's structure.

#### Phase conflicts

When a phase conflicts with another phase (which occurs when an element is accessed by more than one phase transition at once), regardless of whether the shared elements are currently being morphed, an event `phase_conflict` will be emitted containing the state of both phases. Each phase is able to handle what happens when this occurs, whether that means pausing one phase until the conflict is resolved, destroying one phase, or something else - it's entirely customizable.

## Getting Started

### Basic Visualization

To initialize a visualization, you need to specify a container that the network should be contained in:

```Javascript
viz = phase.Network("#viz-container");
```

This will initialize all of the variables needed for the visualization, but it won't attach any data yet. To add data (for sample datasets, see `demos/data/`) and render the elements, you'll use:

```Javascript
viz.data(lesMiserablesData);
```

Once this is done, you should have a basic network rendered in the container!

### Working with Groups

Node groups and link groups are very similar - in fact, the only difference is in the types of style attributes that can be applied (since they are different SVG elements).

To create an element group:

```Javascript
viz.nodeGroup(groupName, filterer);
viz.LinkGroup(groupName, filterer);
```

Example (`morphs` demo):

```Javascript
viz.nodeGroup("rand_node_group", function(d) { return d.group == randNum; });
viz.linkGroup("rand_link_group", function(d) { return d.value == randNum; });
```

The `groupLabel` parameter specifies a label that you can use later to retrieve the group from the `Network` object using the `getNodeGroup()` or `getLinkGroup()` methods. The `filterer` function specifies what conditions must be met by a node or link to include it in the group. In this case, if the node has a `group` value equal to `randNum` or the link has a `value` value equal to `randNum`, then they will be placed into their respective groups.

Once the groups are created, they can be modified together via morphs. Also, using a filterer function isn't the only way to create a group - take a look at the `styling` and `array_grouping` demos for a few other approaches.

### Working with Morphs

To create a morph:

```Javascript
viz.morph(morphName, morphType, change);
```

Example (`morphs` demo):

```Javascript
viz.morph("style_nodes", "style", {"fill": "#7DABFF"});
```

`morphLabel` is a name you can use to refer to the morph - you can retrieve this morph at any time using the `getMorph()` function on the `Network` object. `morphType` specifies whether you're operating on the element or group's data or style. The `change` parameter specifies the changes applied to that element or group when the morph is applied. in the example above, we're making a morph named "style_nodes" that operates on the style of the elements by changing their `fill` property to `#7DABFF` (light blue).

To apply a morph:

```Javascript
group.morph(morphLabel);
```

Example (`morphs` demo):

```Javascript
viz.getNodeGroup("node_group").morph("style_nodes");
```

In this example, we're retrieving a node group object by passing in its label to the `getNodeGroup()` function provided by the `Network` object and applying the morph we just made. All of the nodes contained within that node group should have the morph applied to them, coloring them light blue!

### Working with Phases

Phases require a bit more setup, as they have multiple working parts. To initialize a phase:

```Javascript
viz.phase(phaseLabel);
```

This creates a phase with the label you specify, which can be retrieved via the `getPhase()` method on the `Network` object.

To set up the phase's state and perform other initialization work, we can specify an `initial()` function that is executed immediately before the phase runs:

```Javascript
phaseObject.initial(initFunc);
```

Example (`phase_basic` demo):

```Javascript
basicPhase.initial(function(vizState) {
    basicPhase.state({"val": 0});
});
```

Here we set the initial state of the phase by specifying `phaseObject.state(newState)` - this state will be used throughout the phase to perform our BFS, so it would be handy to keep it within the phase's state.

Whenever the phase calculates its next state (called a phase transition), it will execute the `next()` function:

```Javascript
phaseObject.next(nextFunc);
```

Example (`phase_basic` demo):

```Javascript
basicPhase.next(function(phaseState, vizState) {
    viz.nodeGroup("group_" + phaseState.val, "group", phaseState.val).morph(morph.label);
    phaseState.val++;
});
```

This function will both calculate the next state and apply morphs wherever necessary. In this case, we apply a morph to a specific node group and increment the `val` attribute within the phase state.

Finally, we need to let the phase know when to stop. We do this by specifying an `end()` function:

```Javascript
basicPhase.end(endFunc);
```

Example (`phase_basic` demo):

```Javascript
basicPhase.end(function(phaseState) {
    return phaseState.val >= 11;
});
```

In this example, we tell the phase to stop when the `val` attribute in the phase state reaches 11 or more. You may specify as many conditions as you'd like, but as long as the function returns `false` the phase will continue.

## Demos

Check out one of the demos in the `demos/` folder. They're completely self-contained, so you can open the `.html` file in a browser and start playing around.

In order for the demos to render you must compile the library source code by running
```bash
npm run build
```

If you wish to make changes to the source code and run webpack in watch mode to recompile every time you save you can use
```bash
npm run dev
```

## Testing

For our tests we use [cafetest](https://devexpress.github.io/testcafe/).

To run the tests, you must run a webserver at the top level directory so that testcafe can make requests to the demo HTML pages. You can use any server as long as it uses port 8000. We recommend Python3's `http.server` which you can start up using the command:
```bash
npm run serve
```

From there you can run the tests found in the `test` directory:
```bash
npm run test
```

Alternatively, if you want to just open up all the html files at once to play around with them instead of running the automated tests you can use:
```bash
npm run open
```

## Contributing

If you think a feature is missing, have a suggestion, or find a bug, *please* make an issue!

I'm glad to accept any improvements, especially if they reference a specific issue.

If you'd like to get involved on a more active level, I'd love to chat at matthewrastovac@gmail.com
