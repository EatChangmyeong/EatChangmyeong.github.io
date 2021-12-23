(() => {

const SVG = 'http://www.w3.org/2000/svg';

class Complex {
	constructor(r = 0, i = 0) {
		this.r = r;
		this.i = i;
	}
	add(x) {
		return new Complex(this.r + x.r, this.i + x.i);
	}
	sub(x) {
		return this.add(this.r - x.r, this.i - x.i);
	}
	mul(x) {
		return new Complex(this.r*x.r - this.i*x.i, this.r*x.i + this.i*x.r);
	}
	div(x) {
		return this.mul(x.pow(-1));
	}
	pow(x) {
		const l = Math.hypot(this.r, this.i)**x, d = Math.atan2(this.i, this.r)*x;
		return new Complex(l*Math.cos(d), l*Math.sin(d));
	}
}

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
		this.anim_state = null;
		this.stage_height = 0;
		this.playback = null;
		this.anim = null;

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

		this.anim_state = {
			selection: {
				opacity: [0, 0],
				pos: [0, 0],
				width: [0, 0]
			},
			pivot: {
				opacity: [0, 0],
				pos: [0, 0]
			},
			nodes: []
		};
		const
			node_states = [],
			node_frag = new DocumentFragment();
		nodes.forEach(({ value, parent }, i) => {
			const
				edge = document.createElementNS(SVG, 'line'),
				node = document.createElementNS(SVG, 'circle'),
				label = document.createElementNS(SVG, 'text');

			edge.setAttributeNS(null, 'opacity', '0');
			node.setAttributeNS(null, 'r', '1.5em');
			node.setAttributeNS(null, 'opacity', i ? '0' : '1');
			label.textContent = i ? value.toString() : '-inf';
			node_states.push({
				opacity: [0, 0],
				highlight: [0, 0],
				arm: [0, 0],
				x: [0, 0],
				y: [0, 0],
				parent_x: [0, 0],
				parent_y: [0, 0],
				edge, node, label,
				parent: parent?.index
			});
		});
		node_states.forEach(({ edge }) => node_frag.append(edge));
		node_states.forEach(({ node }) => node_frag.append(node));
		node_states.forEach(({ label }) => node_frag.append(label));
		stage.append(node_frag);
		this.anim_state.nodes = node_states;

		this.render();

		window.lis = this;
	}

	render(animated = false) {
		const update_state = () => {
			function spread([a, b]) {
				return a == null
					? b == null
						? [0, 0]
						: [b, b]
				: b == null
					? [a, a]
					: [a, b];
			}
			function spread_map([a, b], [c, d], fn) {
				return spread([
					a == null || c == null
						? null
						: fn(a, c),
					b == null || d == null
						? null
						: fn(b, d)
				]);
			}

			const
				prev = this.movie.moment(this.time - 1),
				curr = this.movie.moment(this.time),
				{ selection, pivot, nodes } = this.anim_state;

			const
				sel_left_raw = [
					prev.get('selection:left'),
					curr.get('selection:left')
				],
				sel_right_raw = [
					prev.get('selection:right'),
					curr.get('selection:right')
				];
			selection.opacity = sel_left_raw.map(x => +(x != null));
			selection.pos = spread(sel_left_raw);
			selection.width = spread_map(sel_left_raw, sel_right_raw, (l, r) => r - l);

			const
				pivot_raw = [
					prev.get('pivot'),
					curr.get('pivot')
				];
			pivot.opacity = pivot_raw.map(x => +(x != null));
			pivot.pos = spread(pivot_raw);

			nodes.forEach((node, i) => {
				const
					x_raw = [
						prev.get(`node:${i}:x`),
						curr.get(`node:${i}:x`)
					],
					y_raw = [
						prev.get(`node:${i}:y`),
						curr.get(`node:${i}:y`)
					],
					highlight_raw = [
						prev.get(`node:${i}:highlight`),
						curr.get(`node:${i}:highlight`)
					],
					arm_raw = [
						prev.get(`node:${i}:arm`),
						curr.get(`node:${i}:arm`)
					],
					parent_x_raw = [
						prev.get(`node:${node.parent}:x`),
						curr.get(`node:${node.parent}:x`)
					],
					parent_y_raw = [
						prev.get(`node:${node.parent}:y`),
						curr.get(`node:${node.parent}:y`)
					];
				node.opacity = x_raw.map(x => +(x != null));
				node.highlight = spread(highlight_raw);
				node.arm = spread(arm_raw);
				node.x = spread(x_raw);
				node.y = spread(y_raw);
				node.parent_x = spread(parent_x_raw);
				node.parent_y = spread(parent_y_raw);
			});
		};
		const animate = t => {
			function bezier(x) {
				const
					sqrt3 = Math.sqrt(3),
					fx = new Complex(x*(x - 2)).pow(1/2).add(new Complex(1 - x)).pow(1/3),
					lhs = new Complex(-1, -sqrt3).mul(fx),
					rhs = new Complex(-1, sqrt3).div(fx),
					t = lhs.add(rhs).div(new Complex(2)).add(new Complex(1)).r;
				return -0.5*t**3 + 1.5*t;
			}
			function lerp([a, b]) {
				return y*b + (1 - y)*a;
			}

			const
				x = animated
					? Math.max(0, Math.min(1, (t - base_time)/250))
					: 1,
				y = bezier(x),
				middle = 2.5*this.stage_height;
			const
				{
					selection: selection_html,
					pivot: pivot_html
				} = this.html,
				{ selection, pivot, nodes } = this.anim_state;

			selection_html.setAttributeNS(
				null, 'opacity',
				lerp(selection.opacity)
			);
			selection_html.setAttributeNS(
				null, 'x',
				`${5*lerp(selection.pos) - 1}em`
			);
			selection_html.setAttributeNS(
				null, 'width',
				`${5*lerp(selection.width) + 2}em`
			);

			pivot_html.setAttributeNS(
				null, 'opacity',
				lerp(pivot.opacity)
			);
			pivot_html.setAttributeNS(
				null, 'x',
				`${5*lerp(pivot.pos) + 1}em`
			);

			for(const {
				opacity, highlight: [, highlight], arm,
				x, y,
				parent_x, parent_y,
				edge, node, label
			} of nodes) {
				node.setAttributeNS(
					null, 'class',
					highlight ? 'highlight' : ''
				);
				node.setAttributeNS(null, 'opacity', lerp(opacity));
				node.setAttributeNS(null, 'cx', `${5*lerp(x) + 2.5}em`);
				node.setAttributeNS(null, 'cy', `${5*lerp(y) + middle}em`);
				label.setAttributeNS(null, 'opacity', lerp(opacity));
				label.setAttributeNS(null, 'x', `${5*lerp(x) + 2.5}em`);
				label.setAttributeNS(null, 'y', `${5*lerp(y) + middle + 0.4}em`);
				edge.setAttributeNS(null, 'opacity', lerp(arm));
				edge.setAttributeNS(null, 'x1', `${5*lerp(parent_x) + 2.5}em`);
				edge.setAttributeNS(null, 'y1', `${5*lerp(parent_y) + middle}em`);
				edge.setAttributeNS(null, 'x2', `${5*lerp(x) + 2.5}em`);
				edge.setAttributeNS(null, 'y2', `${5*lerp(y) + middle}em`);
			}

			if(x != 1)
				register_animation_frame(animate);
		};
		const register_animation_frame = f => {
			if(this.anim != null)
				cancelAnimationFrame(this.anim);
			this.anim = requestAnimationFrame(f);
		};

		if(matchMedia('(prefers-reduced-motion: reduce)').matches)
			animated = false;
		const base_time = performance.now();

		this.update_slider(this.time + 1);
		update_state();
		register_animation_frame(animate);
	}
	update_slider(t) {
		const { slider, progress } = this.html;
		slider.value = t;
		progress.textContent = `${t} / ${this.duration}`;
	}
}

substitute((e, a) => new Treebox(e, a));

})();