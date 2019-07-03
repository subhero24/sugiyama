// Assigns a vertical order of the nodes to minimize link crossings

function balance(edges1, edges2) {
	if (edges1 == undefined) return 0;
	if (edges2 == undefined) return 0;

	let balance = 0;
	for (let i = 0; i < edges1.length; ++i) {
		for (let j = 0; j < edges2.length; ++j) {
			balance += Math.sign(edges1[i] - edges2[j]);
		}
	}
	return balance;
}

export default function(graph) {
	// Group all nodes by layer
	let level = 0;
	let layers = [];
	do {
		let layer = graph.nodes.filter(n => n.location[0] === level);

		if (layer.length > 0) layers.push(layer);
		else break;
	} while (++level);

	// Assign all nodes an order according to the order they are defined in
	let order = new Map();
	for (let layer of layers) {
		for (let i = 0; i < layer.length; ++i) {
			order.set(layer[i], i);
		}
	}

	// Calculate all average positions
	let positions = new Map();
	for (let node of graph.nodes) {
		let childSum = node.children.reduce((s, p) => (s += order.get(p)), 0);
		let parentSum = node.parents.reduce((s, p) => (s += order.get(p)), 0);
		let childAvg = childSum === 0 ? childSum : childSum / node.children.length;
		let parentAvg = parentSum === 0 ? parentSum : parentSum / node.parents.length;
		positions.set(node, childAvg + parentAvg);
	}

	// Assign a new order based on the average positions
	for (let j = 0; j < layers.length; ++j) {
		layers[j] = layers[j].sort((a, b) => positions.get(a) - positions.get(b));
		for (let i = 0; i < layers[j].length; ++i) {
			order.set(layers[j][i], i);
		}
	}

	// Loop through all the layers and swap if necessary
	// Solution can still be suboptimal, so another strategy is to be considered?
	for (let j = 0; j < layers.length; ++j) {
		let layer = layers[j];

		if (layer.length === 0) break;
		if (layer.length === 1) {
			layer[0].location = [j, 0];
			continue;
		}

		let childEdges = new Map();
		let parentEdges = new Map();
		for (let node of layer) {
			if (layers[j + 1]) childEdges.set(node, node.children.map(c => layers[j + 1].indexOf(c)));
			if (layers[j - 1]) parentEdges.set(node, node.parents.map(p => layers[j - 1].indexOf(p)));
		}

		let swap;
		do {
			swap = false;
			for (let i = 0; i <= layer.length - 2; ++i) {
				let topNodeChildEdges = childEdges.get(layer[i]);
				let topNodeParentEdges = parentEdges.get(layer[i]);

				let bottomNodeChildEdges = childEdges.get(layer[i + 1]);
				let bottomNodeParentEdges = parentEdges.get(layer[i + 1]);

				let childBalance = 0; //balance(topNodeChildEdges, bottomNodeChildEdges);
				let parentBalance = balance(topNodeParentEdges, bottomNodeParentEdges);

				if (childBalance + parentBalance > 0) {
					swap = true;
					[layer[i], layer[i + 1]] = [layer[i + 1], layer[i]];
				}
			}
		} while (swap);

		for (let i = 0; i < layer.length; ++i) {
			layer[i].location[1] = i;
		}
	}
}
