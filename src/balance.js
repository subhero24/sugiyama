// Balance is an iterative method to adjust the position (but not order) to improve graph aesthetics

const FORCE = 0.1;
const MIN_DISTANCE = 1;

// Limiting the max force is necessary because the constraint of the minimum distance
// displaces siblings to account for this distance, which can increase spring lengths,
// which can increase the force of the springs and make the solution unstable

export default function(graph, iterations = 100) {
	let nodes = Array.from(graph.values());
	let previous = new Map();

	for (let node of nodes) {
		node.y = node.order;
		node.x = node.level;
	}

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
		let x = 0;
		while (true) {
			let gradients = new Map();

			let layer = nodes.filter(n => n.level === x).sort((a, b) => a.y - b.y);
			if (layer.length === 0) break;

			for (let node of layer) {
				// Neighbouring child springs
				gradients.set(node, 0);
				for (let neighbour of [...node.children, ...node.parents]) {
					let force = (previous.get(neighbour) - previous.get(node)) * FORCE;
					gradients.set(node, gradients.get(node) + force);
				}
			}

			let i;
			let blockIndex = 0;
			let blockBound = -Infinity;
			for (i = 0; i < layer.length; ++i) {
				let node = layer[i];
				let target = node.y + gradients.get(node);

				if (i === 0 || target < blockBound) {
					// If the node's target is too close to the previous node, just continue grouping nodes
					blockBound = Math.max(blockBound, blockBound + MIN_DISTANCE, target + MIN_DISTANCE);
				} else {
					// If the node's target will be too far away to belongs to the group, group the previous nodes and start a new group
					let block = layer.slice(blockIndex, i);
					let average = block.reduce((g, n) => g + gradients.get(n), 0) / block.length;
					for (let node of block) gradients.set(node, average);

					blockIndex = i;
					blockBound = target + MIN_DISTANCE;
				}
			}

			// All the last nodes also form a group
			let block = layer.slice(blockIndex, i);
			let average = block.reduce((g, n) => g + gradients.get(n), 0) / block.length;
			for (let node of block) gradients.set(node, average);

			// Translate all nodes with their calculated gradient
			for (let [node, gradient] of gradients) node.y += gradient;

			x++;
		}
	}

	return nodes;
}
