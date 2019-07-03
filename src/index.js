import shift from './shift';
import topology from './topology';
import minimize from './minimize';
import normalize from './normalize';
import calculateBounds from './calculate-bounds';
import calculateLocationX from './calculate-location-x';
import calculateLocationY from './calculate-location-y';
import calculateCoordinates from './calculate-coordinates';

export default function(elements, fns) {
	let { childrenFunc, parentFunc, dimensions, margins, iterations } = fns;

	let graph = topology(elements, { childrenFunc, parentFunc });

	minimize(graph);
	calculateLocationX(graph);
	normalize(graph);
	calculateLocationY(graph);
	calculateCoordinates(graph, { dimensions, margins, iterations });
	calculateBounds(graph, { margins });
	shift(graph);

	return graph;
}
