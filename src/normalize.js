// Normalize adds dummy nodes in the graph to avoid links spanning multiple levels
// Reuse already created dummies if possible

const isDummy = node => node.element == undefined;

export default function(graph) {
	for (let parent of graph.nodes) {
		for (let child of [...parent.children]) {
			let distance = child.location[0] - parent.location[0];
			if (distance > 1) {
				// If node and child span multiple levels, remove the relation between the two
				// A new node will be inserted to represent the relation
				child.parents.splice(child.parents.indexOf(parent), 1);
				parent.children.splice(parent.children.indexOf(child), 1);

				// Find the furthest dummy descendent of the parent to use as the starting node for the new connection
				let startNode = parent;
				while (startNode.location[0] < child.location[0] - 1) {
					let dummyChild = startNode.children.find(isDummy);
					if (dummyChild) {
						startNode = dummyChild;
					} else {
						break;
					}
				}

				// Find the closest dummy ancestor of the child to use as the finishing node for the new connection
				let finishNode = child;
				while (finishNode.location[0] > startNode.location[0] + 1) {
					let dummyParent = startNode.children.find(isDummy);
					if (dummyParent) {
						finishNode = dummyParent;
					} else {
						break;
					}
				}

				// Connect start and finish nodes through intermediate dummy nodes
				let previousNode = startNode;
				while (previousNode.location[0] < finishNode.location[0] - 1) {
					let dummyNode = {
						element: null,
						parents: [previousNode],
						children: [],
						location: [previousNode.location[0] + 1, 0],
					};

					graph.nodes.push(dummyNode);
					previousNode.children.push(dummyNode);

					previousNode = dummyNode;
				}
				finishNode.parents.push(previousNode);
				previousNode.children.push(finishNode);
			}
		}
	}
}
