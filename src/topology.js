// Returns a map from the given nodes to an object that contains all the graph info

// Calculates all ancestors of a node
let ancestors = node => {
	// Ancestors are already calculated
	if (node.ancestors != undefined) return node.ancestors;

	// Loop through all parents to add them as ancestors, and recursively add their ancestors too
	node.ancestors = [];
	for (let parent of node.parents) {
		// Check if the parent of this node was already added.
		// This only happens if the original nodes specified the same parent twice
		if (!node.ancestors.includes(parent)) {
			node.ancestors.push(parent);
			// Find all ancestors of the parent and add them if necessary
			for (let ancestor of ancestors(parent)) {
				// An ancestor could already be part of the ancestors if there was
				// another path in the graph leading to this ancestor
				if (!node.ancestors.includes(ancestor)) {
					node.ancestors.push(ancestor);
				}
			}
		}
	}

	return node.ancestors;
};

// Calculates all descendents of a node
let descendents = node => {
	// Descendents are already calculated
	if (node.descendents != undefined) return node.descendents;

	// Loop through all children to add them as descendents, and recursively add their descendents too
	node.descendents = [];
	for (let child of node.children) {
		// Check if the child of this node was already added.
		// This only happens if the original nodes specified the same child twice
		if (!node.descendents.includes(child)) {
			node.descendents.push(child);
			// Find all descendents of the child and add them if necessary
			for (let descendent of descendents(child)) {
				// An descendent could already be part of the descendents if there was
				// another path in the graph leading to this descendent
				if (!node.descendents.includes(descendent)) {
					node.descendents.push(descendent);
				}
			}
		}
	}

	return node.descendents;
};

export default function(elements, fns) {
	let { childFunc, parentFunc } = fns;

	if (childFunc == undefined && parentFunc == undefined) {
		throw new Error('Could not create topology without childFunc or parentFunc');
	}

	// Topology is a map linking the originial node with its corresponding graph information object
	// specifying parents, children, ancestors, descendents, position, ...
	let topology = new Map();
	for (let element of elements) {
		let node = {
			element,
			parents: [],
			children: [],
		};

		topology.set(element, node);
	}

	if (parentFunc && childFunc) {
		// TODO: could use both funcs to calculate all relations in 1 iteration
	} else if (parentFunc) {
		// First we have to loop through all nodes as we can only go "up" the graph
		// and can therefore not know all children of a node while traversing it for the first time

		for (let [element, node] of topology) {
			let parents = parentFunc(element);
			if (parents != undefined && parents.length !== 0) {
				for (let parent of parents) {
					let parentNode = topology.get(parent);
					if (!node.parents.includes(parentNode)) node.parents.push(parentNode);
					if (!parentNode.children.includes(node)) parentNode.children.push(node);
				}
			}
		}

		// After parent-child relations are all set, we can find the ancestors-descendents for all nodes
		let nodes = [];
		for (let [element, node] of topology) {
			ancestors(node);
			descendents(node);
			nodes.push(node);
		}

		return { nodes };
	} else if (childFunc) {
		// TODO
		throw new Error('childFunc not implemented');
	}
}
