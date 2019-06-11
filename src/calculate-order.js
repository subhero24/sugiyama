// Assigns a vertical order of the nodes to minimize link crossings

function shouldSwap(edges1, edges2) {
	let balance = 0;
	for (let i = 0; i < edges1.length; ++i) {
		for (let j = i; j < edges2.length; ++j) {
			balance += Math.sign(edges1[i] - edges2[j]);
		}
	}
	return balance > 0;
}

export default function(graph) {
	// Start with orphans, and position them in order they are defined
	let level = 0;
	let previous = graph.nodes.filter(n => n.location[0] === level);
	for (let i = 0; i < previous.length; ++i) {
		previous[i].location[1] = i;
	}

	while (true) {
		level++;
		let layer = graph.nodes.filter(n => n.location[0] === level);

		if (layer.length === 0) break;
		if (layer.length === 1) {
			layer[0].location[1] = 0;
			continue;
		}

		// Calculate all preferred node positions as average of parent positions
		// as initial estimation of the order
		let order = new Map();
		for (let node of layer) {
			let sum = node.parents.reduce((s, p) => (s += p.location[1]), 0);
			let avg = sum / node.parents.length;
			order.set(node, avg);
		}

		// Calculate all parent edge arrays
		let edges = new Map();
		for (let node of layer) {
			edges.set(node, node.parents.map(p => previous.indexOf(p)));
		}

		// Sort the layer according to the calculated positions
		layer = layer.sort((a, b) => order.get(a) - order.get(b));

		// Bubble sort the layer to minimize edge crossings
		let finished = false;
		while (!finished) {
			finished = true;
			for (let i = 0; i <= layer.length - 2; ++i) {
				let edgesA = edges.get(layer[i]);
				let edgesB = edges.get(layer[i + 1]);
				let swap = shouldSwap(edgesA, edgesB);
				if (swap) {
					finished = false;
					[layer[i], layer[i + 1]] = [layer[i + 1], layer[i]];
				}
			}
		}

		for (let i = 0; i < layer.length; ++i) {
			layer[i].location[1] = i;
		}

		previous = layer;
	}
}
