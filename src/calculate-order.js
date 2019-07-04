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
	// Add layers to the graph
	graph.layers = [];
	for (let node of graph.nodes) {
		let layerIndex = node.location[0];
		let layer = graph.layers[layerIndex];
		if (layer) {
			node.layer = layer;
			node.location[1] = layer.length;

			layer.push(node);
		} else {
			node.layer = [node];
			node.location[1] = 0;
			graph.layers[layerIndex] = node.layer;
		}
	}

	// Calculate all average positions
	let positions = new Map();
	for (let node of graph.nodes) {
		let childSum = node.children.reduce((s, p) => (s += p.location[1]), 0);
		let parentSum = node.parents.reduce((s, p) => (s += p.location[1]), 0);
		let childAvg = childSum === 0 ? childSum : childSum / node.children.length;
		let parentAvg = parentSum === 0 ? parentSum : parentSum / node.parents.length;
		positions.set(node, childAvg + parentAvg);
	}

	for (let layer of graph.layers) {
		let sortedLayer = layer.sort((a, b) => positions.get(a) - positions.get(b));
		for (let i = 0; i < sortedLayer.length; ++i) {
			sortedLayer[i].location[1] = i;
		}
	}

	return graph;
}
