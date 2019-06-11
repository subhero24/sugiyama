// Shifts all nodes to vertically center the graph around the node in the first layer (x = 0)
// that is closest to the vertical center of the graph

export default function(graph) {
	let { minY, maxY } = graph.bounds;
	let nodes = Array.from(graph.values());

	let origin;
	let center = (maxY + minY) / 2;
	let distance = Infinity;
	for (let node of nodes) {
		if (node.level === 0) {
			let dist = Math.abs(node.y - center);
			if (dist < distance) {
				origin = node;
				distance = dist;
			}
		}
	}

	if (origin) {
		let shift = origin.y;
		for (let node of nodes) {
			node.y -= shift;
		}
		graph.bounds.minY -= shift;
		graph.bounds.maxY -= shift;
	}
}
