let objectType = value => {
	return Object.prototype.toString.call(value).match(/\[object (\w+)\]/)[1];
};

export default function(graph, fn = n => n) {
	let nodes = Array.from(graph.values());

	let result = nodes.map(node => {
		let result = {};
		for (let propname in node) {
			let propvalue = node[propname];
			if (graph.has(propvalue)) {
				result[propname] = fn(propvalue);
			} else if (typeof propvalue === 'object' && objectType(propvalue) === 'Array') {
				if (propvalue.every(n => graph.has(n))) {
					result[propname] = propvalue.map(fn);
				} else if (propvalue.every(n => nodes.includes(n))) {
					result[propname] = propvalue.map(n => fn(n.value));
				}
			}

			if (result[propname] == undefined) {
				result[propname] = propvalue;
			}
		}
		return result;
	});

	console.log(JSON.stringify(result, null, 4));
}
