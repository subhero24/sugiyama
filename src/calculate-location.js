import dummies from './dummies';
import calculateLevel from './calculate-level';
import calculateOrder from './calculate-order';

export default graph => {
	graph = calculateLevel(graph);
	graph = dummies(graph);
	graph = calculateOrder(graph);

	return graph;
};
