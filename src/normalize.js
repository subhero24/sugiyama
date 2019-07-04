import shift from './shift';
import calculateBounds from './calculate-bounds';

export default function(graph, options = {}) {
	let { margins } = options;

	graph = calculateBounds(graph, { margins });
	graph = shift(graph);

	return graph;
}
