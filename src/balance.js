// Balance is an iterative method to adjust the position (but not order) to improve graph aesthetics

const FORCE = 0.1;
const MIN_DISTANCE = 1;

// Limiting the max force is necessary because the constraint of the minimum distance
// displaces siblings to account for this distance, which can increase spring lengths,
// which can increase the force of the springs and make the solution unstable

export default function(graph, options = {}) {
	let { width, height, margin, iterations } = options;

	if (width == undefined) width = 0;
	if (height == undefined) height = 0;
	if (margin == undefined) margin = 1;
	if (iterations == undefined) iterations = 100;

	let dimensions = new Map();
	for (let [key, value] of graph.entries()) {
		dimensions.set(value, {
			width: typeof width === 'function' ? width(key) || 0 : width,
			height: typeof height === 'function' ? height(key) || 0 : height,
		});
	}

	let nodes = Array.from(graph.values());

	// Loop over all nodes and group them by level
	let layers = [];
	for (let node of nodes) {
		if (layers[node.level] == undefined) {
			layers[node.level] = [];
		}

		layers[node.level].push(node);
	}

	let x = margin;
	for (let level = 0; level < layers.length; ++level) {
		let y = 0;
		let nodes = layers[level].sort((a, b) => a.order - b.order);
		let levelwidth = Math.max(...nodes.map(n => dimensions.get(n).width));
		for (let node of layers[level]) {
			let nodeheight = dimensions.get(node).height;
			node.x = x + levelwidth / 2;
			node.y = y + nodeheight / 2;

			y = y + nodeheight + margin;
		}

		layers[level] = nodes;
		x = x + levelwidth + margin;
	}

	let previous = new Map();
	for (let i = 0; i < iterations; ++i) {
		// Calculate properties dependent on old coordinates, ie velocity
		let velocities = new Map();
		for (let node of nodes) {
			let oldY = previous.get(node);
			if (oldY == undefined) {
				velocities.set(node, 0);
			} else {
				velocities.set(node, node.y - oldY);
			}
		}

		// Update old coordinates
		for (let node of nodes) {
			previous.set(node, node.y);
		}

		// Calculate layer node gradients
		for (let level = 0; level < layers.length; level++) {
			let layer = layers[level];

			// Calculate gradients according to neighbouring node springs
			let gradients = new Map();
			for (let node of layer) {
				gradients.set(node, 0);
				for (let neighbour of [...node.children, ...node.parents]) {
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
				let height = dimensions.get(node).height;
				let target = node.y + gradients.get(node);
				let lowerbound = target - height / 2;
				let upperbound = target + height / 2;

				if (j === 0 || lowerbound < blockBound) {
					// If the node's target is too close to the previous node, just continue grouping nodes
					blockBound = Math.max(blockBound, blockBound + margin, upperbound + margin);
				} else {
					// If the node's target will be too far away to belongs to the group, group the previous nodes and start a new group
					let block = layer.slice(blockIndex, j);
					let average = block.reduce((g, n) => g + gradients.get(n), 0) / block.length;
					for (let node of block) gradients.set(node, average);

					blockIndex = j;
					blockBound = upperbound + margin;
				}
			}

			// All the last nodes also form a group
			let block = layer.slice(blockIndex, j);
			let average = block.reduce((g, n) => g + gradients.get(n), 0) / block.length;
			for (let node of block) gradients.set(node, average);

			// Translate all nodes with their calculated gradient
			for (let [node, gradient] of gradients) node.y += gradient;
		}
	}

	return nodes;
}
