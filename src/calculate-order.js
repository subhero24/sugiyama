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
	let nodes = Array.from(graph.values());

	// Start with orphans, and position them in order they are defined
	let level = 0;
	let previous = nodes.filter(n => n.level === 0);
	for (let [index, node] of previous.entries()) {
		node.order = index;
	}

	while (true) {
		level++;
		let layer = nodes.filter(n => n.level === level);

		if (layer.length === 0) break;
		if (layer.length === 1) {
			layer[0].order = 0;
			continue;
		}

		//  Calculate all preferred node positions as average of parent positions
		let order = new Map();
		for (let node of layer) {
			let sum = node.parents.reduce((s, p) => (s += p.order), 0);
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

		for (let [index, node] of layer.entries()) {
			node.order = index;
		}

		previous = layer;
	}
}
