// Shifts all nodes to vertically center the graph around the node in the first layer (x = 0)
// that is closest to the vertical center of the graph

export default function(graph) {
	let nodes = Array.from(graph.values());
	let interval = nodes.reduce(
		([min, max], node) => {
			return [Math.min(node.y, min), Math.max(node.y, max)];
		},
		[nodes[0].y, nodes[0].y],
	);

	let [minY, maxY] = interval;
	let center = (maxY - minY) / 2 + minY;

	for (let node of nodes) node.y -= center;
}
