// Normalize adds dummy nodes in the graph to avoid links spanning multiple levels
export default function(graph, options = {}) {
	let defaults = {
		dummyFunc: () => ({}),
	};

	let { dummyFunc } = { ...defaults, ...options };

	let nodes = graph.values();
	for (let parent of nodes) {
		for (let child of parent.children) {
			let distance = child.level - parent.level;
			if (distance > 1) {
				// If node and child span multiple levels, remove the relation between the two
				// A new node will be inserted to represent the relation
				child.parents.splice(child.parents.indexOf(parent), 1);
				parent.children.splice(parent.children.indexOf(child), 1);

				// Roll through all the levels and adding as many nodes as necessary to span the level difference
				let prev = parent;
				for (let i = 0; i < distance - 1; ++i) {
					let node = {
						parents: [],
						children: [],
						level: parent.level + i + 1,
						value: dummyFunc(i, parent, child),
					};

					graph.set(node.value, node);
					node.parents.push(prev);
					prev.children.push(node);

					prev = node;
				}

				child.parents.push(prev);
				prev.children.push(child);
			}
		}
	}
}
