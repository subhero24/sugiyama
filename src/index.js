import topology from './topology';
import minimize from './minimize';
import normalize from './normalize';
import straighten from './straighten';
import calculateLocation from './calculate-location';
import calculatePosition from './calculate-position';

export default function(elements, options) {
	let { childrenFunc, parentFunc, margins = 1, dimensions = 0, iterations = 100 } = options;

	// dimension is expected to be a function that returns an array for reach node
	if (typeof dimensions === 'number') {
		dimensions = () => [dimensions, dimensions];
	} else if (typeof dimensions === 'object') {
		dimensions = () => dimensions;
	}

	// margins is expected to be an array for horizontal and vertical margin
	if (typeof margins === 'number') {
		margins = [margins, margins];
	}

	// Start calculating the layout
	let graph;

	// Calculates the topology which is an object like { nodes: [{ element, parents, children, ancestors, descendents }] }
	graph = topology(elements, { childrenFunc, parentFunc });
	// Removes unnecessary edges between nodes that are also connected through intermediate nodes
	graph = minimize(graph);
	// Find the location of all nodes
	graph = calculateLocation(graph);
	// Calculate the position of all nodes
	graph = calculatePosition(graph, { margins, dimensions, iterations });
	// Clean up edges that are not straight that can be straightened without relayout
	graph = straighten(graph, { margins });
	// Normalize all node positions
	graph = normalize(graph, { margins });

	return graph;
}
