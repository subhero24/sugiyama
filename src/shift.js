// Shifts all nodes to vertically center the graph around the node in the first layer (x = 0)
// that is closest to the vertical center of the graph

export default function(graph) {
	let { bounds, nodes } = graph;
	let { minY, maxY } = bounds;

	let origin;
	let center = (maxY + minY) / 2;
	let distance = Infinity;
	for (let node of nodes) {
		if (node.location[0] === 0) {
			let dist = Math.abs(node.position[1] - center);
			if (dist < distance) {
				origin = node;
				distance = dist;
			}
		}
	}

	if (origin) {
		let shift = origin.position[1];
		for (let node of nodes) {
			node.position[1] -= shift;
		}
		graph.bounds.minY -= shift;
		graph.bounds.maxY -= shift;
	}
}
