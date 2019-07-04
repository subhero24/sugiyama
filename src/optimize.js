// function balance(edges1, edges2) {
// 	if (edges1 == undefined) return 0;
// 	if (edges2 == undefined) return 0;

// 	let balance = 0;
// 	for (let i = 0; i < edges1.length; ++i) {
// 		for (let j = 0; j < edges2.length; ++j) {
// 			balance += Math.sign(edges1[i] - edges2[j]);
// 		}
// 	}
// 	return balance;
// }
// Loop through all the layers and swap if necessary
// Solution can still be suboptimal, so another strategy is to be considered?
// for (let j = 0; j < layers.length; ++j) {
// 	let layer = layers[j];

// 	if (layer.length === 0) break;
// 	if (layer.length === 1) {
// 		layer[0].location = [j, 0];
// 		continue;
// 	}

// 	let childEdges = new Map();
// 	let parentEdges = new Map();
// 	for (let node of layer) {
// 		if (layers[j + 1]) childEdges.set(node, node.children.map(c => layers[j + 1].indexOf(c)));
// 		if (layers[j - 1]) parentEdges.set(node, node.parents.map(p => layers[j - 1].indexOf(p)));
// 	}

// 	let swap;
// 	do {
// 		swap = false;
// 		for (let i = 0; i <= layer.length - 2; ++i) {
// 			let topNodeParentEdges = parentEdges.get(layer[i]);
// 			let bottomNodeParentEdges = parentEdges.get(layer[i + 1]);

// 			if (balance(topNodeParentEdges, bottomNodeParentEdges) > 0) {
// 				swap = true;
// 				[layer[i], layer[i + 1]] = [layer[i + 1], layer[i]];
// 			}
// 		}
// 	} while (swap);

// 	for (let i = 0; i < layer.length; ++i) {
// 		layer[i].location[1] = i;
// 	}
// }
