// This cleans up unnecessary edges which connects two nodes
// that are already connected through intermediate nodes
export default function(graph) {
	for (let node of graph.nodes) {
		for (let parent of node.parents) {
			for (let parentsibling of node.parents) {
				if (parentsibling === parent) continue;
				if (parentsibling.ancestors.includes(parent)) {
					node.parents.splice(node.parents.indexOf(parent), 1);
					parent.children.splice(parent.children.indexOf(node), 1);
				}
			}
		}
	}
}
