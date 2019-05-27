// Assigns a level to all nodes depending on the horizontal order in the graph
// A node moves it child nodes to a level + 1, parent nodes can not receive a levelup based on the level of it's child node.
export default function(graph) {
	for (let node of graph.values()) {
		if (node.parents.length === 0) {
			setLevel(node, 0);
		}
	}

	function setLevel(node, level, skip = []) {
		node.level = level;
		for (let child of node.children) {
			if (skip.includes(child)) continue;
			if (child.level == undefined || child.level < level + 1) {
				setLevel(child, level + 1, [...skip, node]);
			}
		}

		for (let parent of node.parents) {
			if (skip.includes(parent)) continue;
			if (parent.level == undefined) {
				setLevel(parent, level - 1, [...skip, node]);
			}
		}
	}
}
