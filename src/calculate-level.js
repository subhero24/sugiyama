// Assigns a level to all nodes depending on the horizontal order in the graph
// A node moves it child nodes to a level + 1, parent nodes can not receive a levelup based on the level of it's child node.
function setLevel(node, level, skip = []) {
	node.location = [level, 0];
	for (let child of node.children) {
		if (skip.includes(child)) continue;
		if (child.location == undefined || child.location[0] < level + 1) {
			setLevel(child, level + 1, [...skip, node]);
		}
	}

	for (let parent of node.parents) {
		if (skip.includes(parent)) continue;
		if (parent.location == undefined) {
			setLevel(parent, level - 1, [...skip, node]);
		}
	}
}

export default function(graph) {
	for (let node of graph.nodes) {
		if (node.parents.length === 0) {
			node.location = [0, 0];
		}
	}

	for (let node of graph.nodes) {
		if (node.parents.length === 0) {
			setLevel(node, 0);
		}
	}

	return graph;
}
