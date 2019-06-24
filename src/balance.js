// Balance is an iterative method to adjust the position (but not order) to improve graph aesthetics

const FORCE = 0.1;

// Limiting the max force is necessary because the constraint of the minimum distance
// displaces siblings to account for this distance, which can increase spring lengths,
// which can increase the force of the springs and make the solution unstable

const isDummy = node => node.element == undefined;

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

	let previous = new Map();
	for (let i = 0; i < iterations; ++i) {
		// Calculate velocities dependent on old coordinates
		let velocities = new Map();
		for (let node of graph.nodes) {
			let y = previous.get(node);
			if (y == undefined) {
				velocities.set(node, 0);
			} else {
				velocities.set(node, node.position[1] - y);
			}
		}

		// Update old coordinates
		for (let node of graph.nodes) {
			previous.set(node, node.position[1]);
		}

		// Calculate layer node gradients
		for (let level = 0; level < layers.length; level++) {
			let layer = layers[level];

			// Calculate gradients according to neighbouring node springs
			let gradients = new Map();

			for (let node of layer) {
				gradients.set(node, 0);

				// Dummy nodes should only be attracted to its parents as this promotes
				// the bending of the multilevel edges to occur at the ending
				// let neighbours = [...node.parents, ...node.children];
				// let neighbours = node.parents.length ? [...node.parents] : [...node.children];
				let neighbours = node.parents.length ? node.parents : node.children;

				// let neighbours = isDummy(node) ? node.parents : [...node.children, ...node.parents];
				// let neighboursAreDummies = neighbours.every(isDummy);

				for (let neighbour of neighbours) {
					// Only use non-dummy node for attraction, unless all neighbouring nodes are dummies
					// if (!neighboursAreDummies && isDummy(neighbour)) continue;

					let force = (previous.get(neighbour) - previous.get(node)) * FORCE;
					gradients.set(node, gradients.get(node) + force);
				}
			}

			let j;
			let blockIndex = 0;
			let blockBound = -Infinity;
			for (j = 0; j < layer.length; ++j) {
				// debugger;
				let node = layer[j];
				let height = node.dimensions[1];
				let target = node.position[1] + gradients.get(node);
				let lowerbound = target - height / 2;
				let upperbound = target + height / 2;

				if (j === 0 || lowerbound < blockBound) {
					// If the node's target is too close to the previous node, just continue grouping nodes
					blockBound = Math.max(blockBound, blockBound + margins[1], upperbound + margins[1]);
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

			// Translate all nodes with their calculated gradient
			for (let [node, gradient] of gradients) node.position[1] += gradient;
		}
	}

	return graph;
}
