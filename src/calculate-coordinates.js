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

	// set margins needed to balance the graph
	if (typeof margins === 'number') {
		margins = [margins, margins];
	}

	// Set the node dimensions needed to balance the graph
	for (let node of graph.nodes) {
		let dimension = dimensions;
		if (typeof dimension === 'function') {
			dimension = dimension(node.element);
		}
		if (typeof dimension === 'number') {
			dimension = [dimension, dimension];
		}

		node.dimensions = dimension;
	}

	// Loop over all nodes and group them by level
	let layers = [];
	for (let node of graph.nodes) {
		if (layers[node.location[0]] == undefined) {
			layers[node.location[0]] = [];
		}

		layers[node.location[0]].push(node);
	}

	// Loop through all levels and set x and y position before balancing
	let x = margins[0];
	for (let level = 0; level < layers.length; ++level) {
		let y = 0;
		let nodes = layers[level].sort((a, b) => a.location[1] - b.location[1]);
		let levelwidth = Math.max(...nodes.map(n => n.dimensions[0]));
		for (let node of layers[level]) {
			let [width, height] = node.dimensions;
			node.position = [x + width / 2, y + height / 2];

			y = y + height + margins[1];
		}

		layers[level] = nodes;
		x = x + levelwidth + margins[0];
	}

	// Iterate, find gradients
	for (let i = 0; i < iterations; ++i) {
		let gradients = new Map();
		for (let level = 0; level < layers.length; level++) {
			let layer = layers[level];

			for (let node of layer) {
				gradients.set(node, 0);

				let neighbours = [];
				if (i < iterations / 2) {
					neighbours = [...node.parents, ...node.children];
				} else {
					if (node.parents.length === 1 && node.children.length === 0) {
						neighbours = node.parents;
					} else if (node.parents.length === 0 && node.children.length === 1) {
						neighbours = node.children;
					} else if (node.children.length === 1 && node.children[0].parents.length === 1) {
						neighbours = node.children;
					} else if (node.parents.length === 1 && node.parents[0].children.length === 1) {
						neighbours = node.parents;
					}
				}

				for (let neighbour of neighbours) {
					let force = (neighbour.position[1] - node.position[1]) * FORCE;
					gradients.set(node, gradients.get(node) + force);
				}
			}
		}

		// Find gradient collisions that need to displace multiple blocks with same gradient
		for (let level = 0; level < layers.length; level++) {
			let layer = layers[level];

			let j;
			let blockIndex = 0;
			let blockBound = -Infinity;
			for (j = 0; j < layer.length; ++j) {
				let node = layer[j];
				let height = node.dimensions[1];
				let target = node.position[1] + gradients.get(node);
				let lowerbound = target - height / 2;
				let upperbound = target + height / 2;

				if (j === 0 || lowerbound < blockBound) {
					// If the node's target is too close to the previous node, just continue grouping nodes
					blockBound = Math.max(blockBound, blockBound + height + margins[1], upperbound + margins[1]);
				} else {
					// If the node's target will be too far away to belongs to the group, group the previous nodes and start a new group
					let block = layer.slice(blockIndex, j);
					let average = block.reduce((g, n) => g + gradients.get(n), 0) / block.length;
					for (let node of block) gradients.set(node, average);

					blockIndex = j;
					blockBound = upperbound + margins[1];
				}
			}

			// All the last nodes also form a group
			let block = layer.slice(blockIndex, j);
			let average = block.reduce((g, n) => g + gradients.get(n), 0) / block.length;
			for (let node of block) gradients.set(node, average);
		}

		// Translate all nodes with their calculated gradient
		for (let [node, gradient] of gradients) node.position[1] += gradient;
	}

	return graph;
}
