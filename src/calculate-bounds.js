export default (graph, options = {}) => {
	let { margins } = options;

	if (margins == undefined) margins = 1;
	if (typeof margins === 'number') {
		margins = [margins, margins];
	}

	graph.margins = margins;
	for (let node of graph.nodes) {
		if (graph.bounds == undefined) {
			graph.bounds = {
				minX: Infinity,
				minY: Infinity,
				maxX: -Infinity,
				maxY: -Infinity,
			};
		}
		let [width, height] = node.dimensions;

		graph.bounds = {
			minX: Math.min(graph.bounds.minX, node.position[0] - width / 2 - margins[0]),
			minY: Math.min(graph.bounds.minY, node.position[1] - height / 2 - margins[1]),
			maxX: Math.max(graph.bounds.maxX, node.position[0] + width / 2 + margins[0]),
			maxY: Math.max(graph.bounds.maxY, node.position[1] + height / 2 + margins[1]),
		};
	}

	if (graph.bounds == undefined) {
		graph.bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
	}

	return graph;
};
