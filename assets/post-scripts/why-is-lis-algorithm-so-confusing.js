(() => {

const SVG = 'http://www.w3.org/2000/svg';

function binary_search(from, to, fn) {
	while(from != to) {
		const mid = Math.floor((from + to)/2);
		if(fn(mid))
			to = mid;
		else
			from = mid + 1;
	}
	return from;
}

function random_array(l) {
	return [...Array(l)].map(() => Math.floor(100*Math.random()));
}

class Movie {
	constructor() {
		this.props = new Map();
	}
	add_keyframe_internal(t, id, value) {
		if(!this.has_prop(id))
			this.props.set(id, []);
		const moment = this.get_prop_internal(t, id);
		if(moment.index == -1 || !Object.is(value, moment.value))
			this.props.get(id).splice(moment.index + 1, 0, [t, value]);
	}
	add_keyframe(t, ...arr) {
		const len = Math.floor(arr.length/2);
		for(let i = 0; i < len; i++)
			this.add_keyframe_internal(t, arr[2*i], arr[2*i + 1]);
	}
	has_prop(id) {
		return this.props.has(id);
	}
	get_prop_internal(t, id) {
		if(!this.has_prop(id))
			return undefined;
		const
			prop_timeline = this.props.get(id),
			index = binary_search(
				0, prop_timeline.length,
				x => t < prop_timeline[x][0]
			) - 1;
		return index == -1
			? { index }
			: { index, value: prop_timeline[index][1] };
	}
	get_prop(t, id) {
		const { value } = this.get_prop_internal(t, id);
		return value;
	}
	moment(t) {
		const result = new Map();
		for(const x of this.props.keys()) {
			const prop = this.get_prop_internal(t, x);
			if(prop && prop.index != -1)
				result.set(x, prop.value);
		}
		return result;
	}
}

class Treebox {
	constructor(elem, args) {
		this.args = {
			lis_array: false,
			...args
		};
		this.input = random_array(10);
		this.time = 0;
		this.duration = 0;
		// frame:{stop: boolean, duration: number}
		// node:<n>?:{x: number, y: number, arm: boolean, highlight: boolean}
		// cell:<n>?: number
		// selection:left: null | number
		// selection:right: null | number
		// pivot: null | number
		this.movie = null;
		this.stage_height = 0;
		this.playback = null;

		this.html = this.html(elem);
		this.record();
	}

	html(elem) {
		const
			frag = new DocumentFragment(),
				stage_wrapper = document.createElement('div'),
					stage = document.createElementNS(SVG, 'svg'),
						selection = document.createElementNS(SVG, 'rect'),
						pivot = document.createElementNS(SVG, 'rect'),
				controls = document.createElement('div'),
					row1 = document.createElement('div'),
						slider = document.createElement('input'),
						progress = document.createElement('span'),
					row2 = document.createElement('div'),
						play = document.createElement('button'),
						loop = document.createElement('button'),
						step = document.createElement('button'),
						stop = document.createElement('button'),
					row3 = document.createElement('div'),
						input = document.createElement('input'),
						init = document.createElement('button'),
						random = document.createElement('button');

		selection.setAttributeNS(null, 'height', '100%');
		selection.setAttributeNS(null, 'rx', '1em');
		selection.setAttributeNS(null, 'fill', '#00ffff80');
		selection.setAttributeNS(null, 'opacity', '0');
		stage.append(selection);
		pivot.setAttributeNS(null, 'width', '3em');
		pivot.setAttributeNS(null, 'height', '100%');
		pivot.setAttributeNS(null, 'rx', '1em');
		pivot.setAttributeNS(null, 'fill', '#ff000080');
		pivot.setAttributeNS(null, 'opacity', '0');
		stage.append(pivot);
		stage_wrapper.append(stage);
		stage_wrapper.className = 'stage-wrapper';
		frag.append(stage_wrapper);

		slider.type = 'range';
		slider.min = 1;
		slider.addEventListener('input', () => this.update(+slider.value - 1));
		row1.append(slider);
		row1.append(progress);
		row1.className = 'row';
		controls.append(row1);

		play.textContent = '끝까지 실행';
		play.addEventListener('click', () => this.play());
		row2.append(play);
		loop.textContent = '한 루프씩';
		loop.addEventListener('click', () => this.play('loop'));
		row2.append(loop);
		step.textContent = '한 단계씩';
		step.addEventListener('click', () => this.play(''));
		row2.append(step);
		stop.textContent = '멈추기';
		stop.addEventListener('click', () => this.stop());
		row2.append(stop);
		row2.className = 'row';
		controls.append(row2);

		input.type = 'text';
		input.pattern = '(-\\d{1,3}|\\d{1,4})(\\s*[,\\s]\\s*(-\\d{1,3}|\\d{1,4}))*';
		input.required = true;
		input.value = this.input.join(', ');
		input.placeholder = random_array(10).join(', ');
		row3.append(input);
		init.textContent = '적용';
		init.addEventListener('click', () => this.record());
		row3.append(init);
		random.textContent = '랜덤';
		random.addEventListener('click', () => this.randomize());
		row3.append(random);
		row3.className = 'row';
		controls.append(row3);

		controls.className = 'controls';
		frag.append(controls);

		elem.append(frag);

		return {
			elem,
			stage, selection, pivot,
			input, slider, progress
		};
	}

	play(stop = 'end') {
		const internal = () => {
			this.time++;
			this.render(true);

			const
				frame_stop = this.movie.get_prop(this.time, 'frame:stop'),
				frame_duration = this.movie.get_prop(this.time, 'frame:duration');
			switch(stop) {
				case '':
				return;
				case 'loop':
					if(frame_stop)
						return;
				case 'end':
					if(this.time + 1 == this.duration)
						return;
				break;
			}
			this.playback = setTimeout(internal, frame_duration*tick);
		};

		this.stop();
		const
			speed = 1,
			tick = 500/speed;
		internal();
	}
	stop() {
		if(this.playback != null) {
			clearTimeout(this.playback);
			this.playback = null;
		}
	}
	update(t) {
		this.stop();
		this.time = t;
		this.render();
	}

	randomize() {
		this.html.input.value = random_array(10).join(', ');
		this.record();
	}
	record() {
		function align_tree() {
			const root = nodes[0];
			(function set_height(node) {
				if(node.children.length == 0) {
					node.height = 1;
					return;
				}

				let result = 0;
				for(const x of node.children) {
					set_height(x);
					result += x.height;
				}
				node.height = result;
			})(root);
			(function set_y(node, off) {
				node.y = off - node.height/2;
				for(const x of node.children) {
					set_y(x, off);
					off -= x.height;
				}
			})(root, nodes[0].height/2);
		}

		const { input, stage, slider } = this.html;
		if(!input.validity.valid)
			return;
		this.input = input.value.split(/\s*[,\s]\s*/).map(x => +x);

		if(this.playback != null) {
			clearTimeout(this.playback);
			this.playback = null;
		}
		this.time = 0;
		this.duration = 0;
		for(const x of stage.querySelectorAll('rect.background, line, circle, text'))
			stage.removeChild(x);

		const
			nodes = [-Infinity, ...this.input].map((value, index) => (
				{ index, value, parent: null, children: [], x: 0, y: 0, height: 1 }
			)),
			min_array = [nodes[0]];

		this.movie = new Movie();
		this.movie.add_keyframe(
			this.duration++,
			'frame:stop', false,
			'frame:duration', 0,
			'node:0:x', 0,
			'node:0:y', 0,
			'node:0:arm', false,
			'node:0:highlight', true,
			'cell:0:value', -Infinity,
			'selection:left', null,
			'selection:right', null,
			'pivot', null
		);
		this.input.forEach((x, i) => {
			// binary search
			let from = 1, to = min_array.length;
			this.movie.add_keyframe(
				this.duration++,
				'frame:stop', false,
				'frame:duration', 1,
				`node:${i + 1}:x`, 0,
				`node:${i + 1}:y`, 1,
				`node:${i + 1}:arm`, false,
				'selection:left', from,
				'selection:right', to,
				'pivot', null
			);
			while(from != to) {
				const mid = Math.floor((from + to)/2);
				this.movie.add_keyframe(
					this.duration++,
					'pivot', mid
				);
				if(x <= min_array[mid].value)
					to = mid;
				else
					from = mid + 1;
				this.movie.add_keyframe(
					this.duration++,
					'frame:duration', 1,
					'selection:left', from,
					'selection:right', to,
					'pivot', null
				);
			}
			this.movie.add_keyframe(
				this.duration - 1,
				'frame:duration', 2
			);

			// insert node
			const this_node = nodes[i + 1];
			min_array[from - 1].children.push(this_node);
			this_node.parent = min_array[from - 1];
			this_node.x = this_node.parent.x + 1;
			align_tree();
			this.movie.add_keyframe(
				this.duration,
				'frame:stop', true,
				'frame:duration', 4,
				`node:${i + 1}:x`, this_node.x,
				`node:${i + 1}:arm`, true,
				`node:${i + 1}:highlight`, true,
				...[...Array(i + 2)].map((_, j) =>
					[`node:${j}:y`, nodes[j].y]
				).flat(),
				`cell:${from}`, x,
				'selection:left', null,
				'selection:right', null
			);
			if(from in min_array) {
				const disqualified = min_array[from].index;
				min_array[from] = this_node;
				this.movie.add_keyframe(
					this.duration,
					'frame:stop', true,
					'frame:duration', 4,
					`node:${i + 1}:x`, this_node.x,
					`node:${i + 1}:arm`, true,
					`node:${i + 1}:highlight`, true,
					`node:${disqualified}:highlight`, false,
					...[...Array(i + 2)].map((_, j) =>
						[`node:${j}:y`, nodes[j].y]
					).flat(),
					`cell:${from}`, x,
					'selection:left', null,
					'selection:right', null
				);
			} else
				min_array.push(this_node);
			this.duration++;
		});

		this.stage_height = nodes[0].height;
		slider.max = this.duration;
		stage.setAttributeNS(null, 'width', `${5*min_array.length + 1}em`);
		stage.setAttributeNS(
			null, 'height',
			`${5*Math.max(
				this.stage_height,
				this.stage_height/2 + 1.5
			)}em`
		);

		const stripe_frag = new DocumentFragment();
		for(let i = 0; i < min_array.length; i += 2) {
			const stripe = document.createElementNS(SVG, 'rect');
			stripe.setAttributeNS(null, 'class', 'background');
			stripe.setAttributeNS(null, 'x', `${5*i}em`);
			stripe.setAttributeNS(null, 'width', '5em');
			stripe.setAttributeNS(null, 'height', '100%');
			stripe_frag.append(stripe);
		}
		stage.prepend(stripe_frag);

		this.html.animate = [];
		this.html.nodes = [];
		const node_frag = new DocumentFragment();
		nodes.forEach(({ value, parent }, i) => {
			const
				edge = document.createElementNS(SVG, 'line'),
				node = document.createElementNS(SVG, 'circle'),
				label = document.createElementNS(SVG, 'text');

			edge.setAttributeNS(null, 'opacity', '0');
			node.setAttributeNS(null, 'r', '1.5em');
			node.setAttributeNS(null, 'opacity', i ? '0' : '1');
			label.textContent = i ? value.toString() : '-inf';
			this.html.nodes.push({
				edge, node, label,
				parent: parent?.index
			});
		});
		this.html.nodes.forEach(({ edge }) => node_frag.append(edge));
		this.html.nodes.forEach(({ node }) => node_frag.append(node));
		this.html.nodes.forEach(({ label }) => node_frag.append(label));
		stage.append(node_frag);

		this.render();

		window.lis = this;
	}

	render(animated = false) {
		function animate(elem, args) {
			for(const i in args) {
				let
					from = args[i](0),
					to = args[i](1);
				if(from == null)
					from = to;
				if(to == null)
					to = from;
				if(from === null)
					continue;

				const x = {
					attributeName: i,
					calcMode: 'spline',
					keySplines: '0 0.5 0.5 1',
					repeatCount: '1',
					dur: '0.25s',
					values: `${from}; ${to}`
				};
				elem.setAttributeNS(null, i, to);
				if(!animated || from == to)
					continue;

				const animate = document.createElementNS(SVG, 'animate');
				for(const y in x)
					animate.setAttributeNS(null, y, x[y]);
				elem.appendChild(animate);
				anim_elem.push(animate);
			}
		}

		if(matchMedia('(prefers-reduced-motion: reduce)').matches)
			animated = false;
		const { stage, nodes, selection, pivot, animate: html_animate } = this.html;
		const
			anim_elem = [],
			previous = this.movie.moment(this.time - 1),
			moment = this.movie.moment(this.time),
			stage_middle = 2.5*this.stage_height;

		this.update_slider(this.time + 1);
		for(const x of html_animate)
			x.endElement();
		for(const x of stage.querySelectorAll('animate'))
			x.parentElement.removeChild(x);
		nodes.forEach(({ edge, node, label, parent }, i) => {
			const
				node_exists = [previous.has(`node:${i}:x`), moment.has(`node:${i}:x`)],
				edge_exists = [!!previous.get(`node:${i}:arm`), !!moment.get(`node:${i}:arm`)],
				node_x = [previous.get(`node:${i}:x`), moment.get(`node:${i}:x`)],
				node_y = [previous.get(`node:${i}:y`), moment.get(`node:${i}:y`)],
				parent_x = [previous.get(`node:${parent}:x`), moment.get(`node:${parent}:x`)],
				parent_y = [previous.get(`node:${parent}:y`), moment.get(`node:${parent}:y`)],
				highlight = [!!previous.get(`node:${i}:highlight`), !!moment.get(`node:${i}:highlight`)];

			animate(node, {
				opacity: x => `${+node_exists[x]}`,
				cx: x => node_x[x] != undefined ? `${5*node_x[x] + 2.5}em` : null,
				cy: x => node_y[x] != undefined ? `${5*node_y[x] + stage_middle}em` : null
			});
			animate(label, {
				opacity: x => `${+node_exists[x]}`,
				x: x => node_x[x] != undefined ? `${5*node_x[x] + 2.5}em` : null,
				y: x => node_y[x] != undefined ? `${5*node_y[x] + stage_middle + 0.4}em` : null
			});
			animate(edge, {
				opacity: x => `${+edge_exists[x]}`,
				x1: x => parent_x[x] != undefined ? `${5*parent_x[x] + 2.5}em` : null,
				y1: x => parent_y[x] != undefined ? `${5*parent_y[x] + stage_middle}em` : null,
				x2: x => node_x[x] != undefined ? `${5*node_x[x] + 2.5}em` : null,
				y2: x => node_y[x] != undefined ? `${5*node_y[x] + stage_middle}em` : null
			});
			if(node_exists[1])
				node.setAttributeNS(null, 'class', highlight[1] ? 'highlight' : '');
		});

		const
			sel_left = [previous.get('selection:left'), moment.get('selection:left')],
			sel_exists = sel_left.map(x => x != null),
			sel_right = [previous.get('selection:right'), moment.get('selection:right')],
			sel_width = [
				sel_left[0] != null && sel_right[0] != null
					? sel_right[0] - sel_left[0]
					: null,
				sel_left[1] != null && sel_right[1] != null
					? sel_right[1] - sel_left[1]
					: null
			],
			pivot_pos = [previous.get('pivot'), moment.get('pivot')],
			pivot_exists = pivot_pos.map(x => x != null);

		animate(selection, {
			opacity: x => `${+sel_exists[x]}`,
			x: x => sel_left[x] != null ? `${5*sel_left[x] - 1}em` : null,
			width: x => sel_width[x] != null ? `${5*sel_width[x] + 2}em` : null
		});

		animate(pivot, {
			opacity: x => `${+pivot_exists[x]}`,
			x: x => pivot_pos[x] != null ? `${5*pivot_pos[x] + 1}em` : null
		});

		for(const x of anim_elem)
			x.beginElement();
		this.html.animate = anim_elem;
	}
	update_slider(t) {
		const { slider, progress } = this.html;
		slider.value = t;
		progress.textContent = `${t} / ${this.duration}`;
	}
}

substitute((e, a) => new Treebox(e, a));

})();