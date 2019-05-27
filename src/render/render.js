import layout from '../layout';
import nodes from '../examples/1';

let graph = layout(nodes, {
	parentFunc: node => node.parents.map(id => nodes.find(n => n.id === id)),
	dummyFunc: i => {
		return { id: `dummy` };
	},
});

let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let { width, height } = canvas.getBoundingClientRect();
canvas.setAttribute('width', width);
canvas.setAttribute('height', height);

let radius = 10;
let transform = ([x, y]) => [x * 100 + 100, y * 100 + height / 2];
for (let node of graph.values()) {
	let isDummy = node.value.id === 'dummy';
	let [x, y] = transform([node.level, node.y]);
	context.beginPath();
	context.arc(x, y, radius, 0, 2 * Math.PI, false);
	context.fillStyle = isDummy ? '#AAA' : 'green';
	context.fill();
	context.lineWidth = 5;
	context.strokeStyle = isDummy ? '#999' : 'green';
	context.stroke();

	for (let child of node.children) {
		let [childx, childy] = transform([child.level, child.y]);
		context.beginPath();
		context.strokeStyle = '#666';
		context.moveTo(x, y);
		context.lineTo(childx, childy);
		context.stroke();
	}
}
