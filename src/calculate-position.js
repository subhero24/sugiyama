// An iterative method to adjust the position (but not order) to improve graph aesthetics
// Happens in 2 phases
// First half of the iterations, all nodes are connected and pull on each other
// Second half of the iterations, only nodes that have each other as only dependency pull on each otther

const FORCE = 0.1; // Must be smaller than 1 to avoid divergence

// Limiting the max force is necessary because the constraint of the minimum distance
// displaces siblings to account for this distance, which can increase spring lengths,
// which can increase the force of the springs and make the solution unstable

export default function(graph, options = {}) {
	let { dimensions, margins, iterations } = options;

	if (margins == undefined) margins = 1;
	if (dimensions == undefined) dimensions = 0;
	if (iterations == undefined) iterations = 100;

	for (let node of graph.nodes) {
		node.dimensions = dimensions(node.element);
	}

	// Loop through all levels and set x and y position before balancing
	let x = margins[0];
	for (let level = 0; level < graph.layers.length; ++level) {
		let y = 0;
		let nodes = graph.layers[level].sort((a, b) => a.location[1] - b.location[1]);
		let levelwidth = Math.max(...nodes.map(n => n.dimensions[0]));
		for (let node of graph.layers[level]) {
			let [width, height] = node.dimensions;
			node.position = [x + width / 2, y + height / 2];

			y = y + height + margins[1];
		}

		graph.layers[level] = nodes;
		x = x + levelwidth + margins[0];
	}

	// Iterate, find gradients
	for (let i = 0; i < iterations; ++i) {
		let gradients = new Map();
		for (let node of graph.nodes) {
			gradients.set(node, 0);

			let neighbours = [...node.parents, ...node.children];
			for (let neighbour of neighbours) {
				let force = (neighbour.position[1] - node.position[1]) * FORCE;
				gradients.set(node, gradients.get(node) + force);
			}
		}

		// Find gradient collisions that need to displace multiple blocks with same gradient
		for (let level = 0; level < graph.layers.length; level++) {
			let layer = graph.layers[level];

			let blockBound = Infinity;
			let blockGradients = [];
			for (let j = 0; j < layer.length; ++j) {
				let node = layer[j];
				let height = node.dimensions[1];
				let gradient = gradients.get(node);
				let nodeTop = node.position[1] - margins[1] / 2 - height / 2;
				let nodeBottom = node.position[1] + margins[1] / 2 + height / 2;
				let targetTop = nodeTop + gradient;
				let targetBottom = nodeBottom + gradient;

				if (targetTop < blockBound) {
					// Collision of node in to the current block
					blockGradients.push(gradient);
					blockBound = nodeBottom + blockGradients.reduce((g, s) => g + s) / blockGradients.length;
				} else {
					// Node does not collide with current block
					// Reposition the nodes in the previous block, and start a new block
					let blockNodes = layer.slice(j - blockGradients.length, j);
					let blockGradient = blockGradients.reduce((g, s) => g + s) / blockGradients.length;
					for (let blockNode of blockNodes) {
						gradients.set(blockNode, blockGradient);
					}

					blockBound = targetBottom;
					blockGradients = [gradient];
				}
			}

			let blockNodes = layer.slice(layer.length - blockGradients.length, layer.length);
			let blockGradient = blockGradients.reduce((g, s) => g + s) / blockGradients.length;
			for (let blockNode of blockNodes) {
				gradients.set(blockNode, blockGradient);
			}
		}

		// Translate all nodes with their calculated gradient
		for (let [node, gradient] of gradients) node.position[1] += gradient;
	}

	return graph;
}
