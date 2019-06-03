import layout from '../index.js';
import nodes from '../examples/1';

let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let { width, height } = canvas.getBoundingClientRect();
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);

// for (let node of nodes) {
// 	node.width = Math.random() * 80 + 20;
// 	node.height = Math.random() * 80 + 20;
// }

let iterations = 0;
let handleClick = () => {
	let layoutOptions = {
		margin: 30,
		width: 100,
		height: 50,
		iterations,
		dummyFunc: i => ({ id: `dummy-${i}` }),
		parentFunc: node => node.parents.map(id => nodes.find(n => n.id === id)),
	};

	let graph = layout(nodes, layoutOptions);

	context.clearRect(0, 0, width, height);

	let radius = 10;
	// let transform = ([x, y]) => [x * 100 + 100, y * 100 + height / 2];
	let transform = ([x, y]) => [x, y + height / 2];
	for (let node of graph.values()) {
		// debugger;
		let isDummy = node.value.id === 'dummy';
		let [x, y] = transform([node.x, node.y]);
		context.beginPath();
		// context.arc(x, y, radius, 0, 2 * Math.PI, false);
		context.rect(
			x - layoutOptions.width / 2,
			y - layoutOptions.height / 2,
			layoutOptions.width,
			layoutOptions.height,
		);
		context.fillStyle = isDummy ? '#AAA' : 'green';
		context.fill();
		context.lineWidth = 5;
		context.strokeStyle = isDummy ? '#999' : 'green';

		for (let child of node.children) {
			let [childx, childy] = transform([child.x, child.y]);
			context.beginPath();
			context.strokeStyle = '#666';
			context.moveTo(x, y);
			context.lineTo(childx, childy);
			context.stroke();
		}
	}
	iterations++;
};

let looper = () => {
	if (iterations < 100) {
		handleClick();
		setTimeout(looper, 16);
	}
};

looper();
