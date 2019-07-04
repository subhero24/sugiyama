// Checks if there are edges that can be straightened for free (without )

let collide = (parentBound, siblingBound) => {
	return siblingBound.bottom > parentBound.top && siblingBound.top < parentBound.bottom;
};

let nodeBounds = (node, margins) => {
	return {
		top: node.position[1] - node.dimensions[1] / 2 - margins[1] / 2,
		bottom: node.position[1] + node.dimensions[1] / 2 + margins[1] / 2,
	};
};

export default function(graph, options = {}) {
	let { margins = [1, 1] } = options;

	// Calculate nodeBounds
	let bounds = new Map();
	for (let node of graph.nodes) {
		bounds.set(node, nodeBounds(node, margins));
	}

	// Sweep edges straight from left to right
	for (let layer of graph.layers) {
		for (let node of layer) {
			if (node.parents.length === 1 && node.parents[0].children.length === 1) {
				let parent = node.parents[0];
				let parentBound = bounds.get(parent);
				let collisionNode = layer.find(n => n !== node && collide(parentBound, bounds.get(n)));

				if (collisionNode == undefined) {
					node.position[1] = parent.position[1];
					bounds.set(node, nodeBounds(node, margins));
				}
			}
		}
	}

	// An edge can still be bended if the child did not have any place to move
	// We should also swipe from right to left to see if the parent could fix the problem
	// Sweep edges straight from right to left
	for (let layer of graph.layers) {
		for (let node of layer) {
			if (node.children.length === 1 && node.children[0].parents.length === 1) {
				let child = node.children[0];
				let childBound = bounds.get(child);
				let collisionNode = layer.find(n => n !== node && collide(childBound, bounds.get(n)));

				if (collisionNode == undefined) {
					node.position[1] = child.position[1];
					bounds.set(node, nodeBounds(node, margins));
				}
			}
		}
	}

	return graph;
}
