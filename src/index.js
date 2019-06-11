import shift from './shift';
import balance from './balance';
import topology from './topology';
import minimize from './minimize';
import normalize from './normalize';
import calculateOrder from './calculate-order';
import calculateLevel from './calculate-level';
import calculateBounds from './calculate-bounds';

export default function(elements, fns) {
	let { childrenFunc, parentFunc, dimensions, margins, iterations } = fns;

	let graph = topology(elements, { childrenFunc, parentFunc });

	minimize(graph);
	calculateLevel(graph);
	normalize(graph);
	calculateOrder(graph);
	balance(graph, { dimensions, margins, iterations });
	calculateBounds(graph, { margins });
	shift(graph);

	return graph;
}
