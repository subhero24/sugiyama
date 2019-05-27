import shift from './shift';
import balance from './balance';
import topology from './topology';
import minimize from './minimize';
import normalize from './normalize';
import calculateOrder from './calculate-order';
import calculateLevel from './calculate-level';

export default function(nodes, fns) {
	let { childrenFunc, parentFunc, dummyFunc } = fns;

	let graph = topology(nodes, { childrenFunc, parentFunc });

	minimize(graph);
	calculateLevel(graph);
	normalize(graph, dummyFunc);
	calculateOrder(graph);
	balance(graph);
	shift(graph);

	return graph;
}
