// Checks if there are edges that can be straightened for free (without )

let collide = (parentBound, siblingBound) => {
	return siblingBound.bottom > parentBound.top || siblingBound.top < parentBound.bottom;
};

export default function(graph, options = {}) {
	let { dimensions, margins, iterations } = options;

	// Calculate nodeBounds
	let bounds = new Map();
	for (let node of graph.nodes) {
		bounds.set(node, {
			top: node.position[1] - node.dimensions[1] / 2 - margins[1] / 2,
			bottom: node.position[1] + node.dimensions[1] / 2 + margins[1] / 2,
		});
	}

	for (let node of graph.nodes) {
		if (node.parents.length === 1 && node.parents[0].children.length === 1) {
			let layer = graph.layers[node.location[0]];
			let parent = node.parents[0];
			let parentBound = bounds.get(parent);
			let collisionNode = layer.find(layerNode => {
				layerNode !== node && collide(parentBound, bounds.get(layerNode));
			});

			if (collisionNode == undefined) {
				node.position[1] = parent.position[1];
			}
		}
	}

	return graph;
}
