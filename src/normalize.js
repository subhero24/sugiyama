// Normalize adds dummy nodes in the graph to avoid links spanning multiple levels
export default function(graph) {
	for (let parent of graph.nodes) {
		for (let child of [...parent.children]) {
			let distance = child.location[0] - parent.location[0];
			if (distance > 1) {
				// If node and child span multiple levels, remove the relation between the two
				// A new node will be inserted to represent the relation
				child.parents.splice(child.parents.indexOf(parent), 1);
				parent.children.splice(parent.children.indexOf(child), 1);

				// Roll through all the levels and adding as many nodes as necessary to span the level difference
				let prev = parent;
				for (let i = 0; i < distance - 1; ++i) {
					let node = {
						element: null,
						parents: [],
						children: [],
						location: [parent.location[0] + i + 1, 0],
					};

					graph.nodes.push(node);
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
