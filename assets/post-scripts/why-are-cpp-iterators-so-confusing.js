(() => {

class Cursorbox {
	constructor(elem, args) {
		this.args = {
			sorted: false,
			insertable: true,
			writable: true,
			movable: true,
			random: true,
			selectable: false,
			bounds: false,
			reversible: false,
			...args
		};
		this.arr = [...Array(10)].map(() => Math.floor(10*Math.random()));
		if(this.args.sorted)
			this.arr.sort();
		this.begin = 0;
		this.end = 0;
		this.mode = 'Insert'; // 'Overwrite', 'Overwrite+'
		this.rtl = false;
		this.selecting = false;
		this.anchor = 0;
		this.constructor.list.push(this);

		this.html = this.html(elem);
		this.update_cell();
		this.update_control();
	}
	static list = [];

	html(elem) {
		const
			gen_grid = () => {
				const gen_cursor = () => {
					const
						anchor = document.createElement('div'),
						cursor = document.createElement('div');
					anchor.className = 'cursor-anchor';
					cursor.className = 'cursor';
					anchor.appendChild(cursor);
					if(this.args.reversible) {
						const direction = document.createElement('div');
						direction.className = 'cursor-direction';
						anchor.appendChild(direction);
					}
					return anchor;
				};
	
				const
					grid = document.createElement('div'),
					cells = [...Array(10)].map(() => document.createElement('div')),
					cursor = gen_cursor();
				grid.className = 'array';
				grid.tabIndex = 0;
				cells.forEach((x, i) => {
					x.className = 'cell';
					grid.appendChild(x);
				});
				grid.appendChild(cursor);
				return [grid, cells, cursor];
			},
			gen_controls = list => {
				function maybe_call(f) {
					return typeof f === 'function' ? f() : f;
				}
				const glossary = {
					'←': '왼쪽 방향키',
					'→': '오른쪽 방향키',
					'LMB': '왼쪽 마우스 버튼'
				};

				const elems = [];
				const controls = document.createElement('ul');
				controls.className = 'controls';
				for(const { keys, visible, desc, human} of list) {
					const
						entry = document.createElement('li'),
						strong = document.createElement('strong'),
						span = document.createElement(human ? 'span' : 'code');
					entry.style.display =
						(typeof visible === 'function' ? visible() : visible)
							? ''
							: 'none';
					keys.forEach((x, i) => {
						if(i%2 && x)
							strong.appendChild(document.createTextNode(x));
						else {
							const kbd = document.createElement('kbd');
							kbd.textContent = x;
							if(x in glossary)
								kbd.title = glossary[x];
							strong.appendChild(kbd);
						}
					});
					entry.appendChild(strong);
					span.textContent = typeof desc === 'function' ? desc() : desc;
					entry.appendChild(span);
					controls.appendChild(entry);

					elems.push(() => {
						entry.style.display = maybe_call(visible)
							? ''
							: 'none';
						span.textContent = maybe_call(desc);
					});
				}
				return [controls, elems];
			};

		const
			keyboard_input = [
				{
					keys: [{ key: 'ArrowLeft', shift: undefined }],
					handler: e => this.left(e)
				},
				{
					keys: [{ key: 'ArrowRight', shift: undefined }],
					handler: e => this.right(e)
				},
				{
					keys: ['Insert', { key: 'i', ctrl: true }],
					handler: e => this.insert(e)
				},
				{
					keys: [...'0123456789'],
					handler: e => this.write(e)
				},
				{
					keys: [...'0123456789'].map(key => ({ key, alt: true })),
					handler: e => this.bounds(e)
				},
				{
					keys: [
						{ key: 'Home', shift: undefined },
						{ key: ['h', 'H'], shift: undefined }
					],
					handler: e => this.to_begin(e)
				},
				{
					keys: [
						{ key: 'End', shift: undefined },
						{ key: ['l', 'L'], shift: undefined }
					],
					handler: e => this.to_end(e)
				},
				{
					keys: [{ key: 'a', ctrl: true }],
					handler: e => this.all(e)
				},
				{
					keys: ['r'],
					handler: e => this.reverse(e)
				}
			],
			controls_listing = [
				{
					keys: ['←'],
					visible: this.args.movable,
					desc: () => this.rtl ? 'it++;' : 'it--;'
				},
				{
					keys: ['→'],
					visible: this.args.movable,
					desc: () => this.rtl ? 'it--;' : 'it++;'
				},
				{
					keys: ['Home', ' / ', 'H'],
					visible: this.args.movable,
					desc: () => this.rtl
						? 'it = arr.rbegin();'
						: 'it = arr.begin();'
				},
				{
					keys: ['End', ' / ', 'L'],
					visible: this.args.movable,
					desc: () => this.rtl
						? 'it = arr.rend();'
						: 'it = arr.end();'
				},
				{
					keys: ['LMB'],
					visible: this.args.movable && this.args.random,
					desc: () => this.rtl
						? 'it = arr.rend() - x;'
						: 'it = arr.begin() + x;'
				},
				{
					keys: this.args.random
						? ['Shift', '+', '←', '/', '→', ' / ', 'LMB']
						: ['Shift', '+', '←', '/', '→'],
					visible: this.args.selectable && (this.args.random || this.args.movable),
					desc: '영역 선택',
					human: true
				},
				{
					keys: ['Alt', '+', '0', '...', '9'],
					visible: this.args.selectable && this.args.bounds,
					desc: '해당 숫자만 선택',
					human: true
				},
				{
					keys: ['Ctrl', '+', 'A'],
					visible: this.args.selectable,
					desc: '전체 선택',
					human: true
				},
				{
					keys: ['Insert', ' / ', 'Ctrl', '+', 'I'],
					visible: this.args.insertable,
					desc: () => ({
						'Insert': '수정 모드',
						'Overwrite': '수정 모드 (자동 가산)',
						'Overwrite+': '삽입 모드'
					}[this.mode]),
					human: true
				},
				{
					keys: ['0', '...', '9'],
					visible: () => this.args.writable && this.mode != 'Insert',
					desc: () => this.mode == 'Overwrite+'
						? '*it++ = x;'
						: '*it = x;'
				},
				{
					keys: ['R'],
					visible: this.args.reversible,
					desc: () => this.rtl
						? 'it = it.base;'
						: 'it = make_reverse_iterator(it);'
				}
			];
		
		const
			frag = new DocumentFragment(),
			[grid, cells, cursor] = gen_grid(),
			[controls, ctrl] = gen_controls(controls_listing);
		attach_keyboard_input(grid, keyboard_input);
		frag.appendChild(grid);
		frag.appendChild(controls);
		elem.appendChild(frag);
		if(this.args.movable && this.args.random) {
			grid.addEventListener('mousedown', e => this.click(e));
			grid.addEventListener('mousemove', e => {
				if(this.selecting)
					this.drag(e);
			});
		}
		return {
			elem,
			grid, cells, cursor,
			ctrl
		};
	}

	update_cursor() {
		const cursor = this.html.cursor;
		if(
			this.begin == this.end &&
			(
				this.mode == 'Insert' ||
				this.begin == (this.rtl ? 0 : 10)
			)
		) {
			const classname = cursor.className;
			cursor.style.display = '';
			cursor.style.left = `${3.25*this.begin}rem`;
			// classList.remove somehow doesn't work here
			cursor.className = '';
			// black magic from https://css-tricks.com/restart-css-animation/
			void cursor.offsetWidth;
			cursor.className = classname;
		} else
			cursor.style.display = 'none';

		this.html.cells.forEach((x, i) => {
			const
				selected = this.begin <= i && i < this.end,
				blinking =
					this.mode != 'Insert' &&
					i == (this.rtl ? this.begin - 1 : this.begin);
			class_if(x,
				'selected', selected,
				'blinking', !selected && blinking
		);
		});
	}
	update_cell() {
		this.html.cells.forEach((x, i) => x.textContent = this.arr[i]);
	}
	update_control() {
		for(const x of this.html.ctrl)
			x();
	}
	left(e) {
		function decrement(x) {
			return Math.max(0, x - 1);
		}

		if(!this.args.movable || this.selecting)
			return;
		
		if(e && e.shiftKey && this.args.selectable)
			if(this.end == this.anchor)
				this.begin = decrement(this.begin);
			else
				this.end = decrement(this.end);
		else
			this.begin =
			this.end =
			this.anchor =
				this.begin != this.end
					? this.begin
					: decrement(this.begin);
		
		this.update_cursor();
		if(e)
			e.preventDefault();
	}
	right(e) {
		function increment(x) {
			return Math.min(10, x + 1);
		}

		if(!this.args.movable || this.selecting)
			return;
		
		if(e && e.shiftKey && this.args.selectable)
			if(this.begin == this.anchor)
				this.end = increment(this.end);
			else
				this.begin = increment(this.begin);
		else
			this.begin =
			this.end =
			this.anchor =
				this.end != this.begin
					? this.end
					: increment(this.end);
		
		this.update_cursor();
		if(e)
			e.preventDefault();
	}
	insert(e) {
		const next = {
			'Insert': 'Overwrite',
			'Overwrite': 'Overwrite+',
			'Overwrite+': 'Insert'
		};

		if(!this.args.insertable || this.selecting)
			return;
		
		this.mode = this.mode in next
			? next[this.mode]
			: 'Insert';

		this.update_cursor();
		this.update_control();
		e.preventDefault();
	}
	write(e) {
		if(
			!this.args.writable ||
			this.mode == 'Insert' ||
			this.begin != this.end ||
			this.begin == (this.rtl ? 0 : 10) ||
			this.selecting
		)
			return;
		
		this.arr[this.rtl ? this.begin - 1 : this.begin] = e.key;
		if(this.mode == 'Overwrite+')
			if(this.rtl)
				this.left();
			else
				this.right();
		
		this.update_cell();
		e.preventDefault();
	}
	bounds(e) {
		const binary_search = right => {
			let begin = 0, end = 10;
			while(begin != end) {
				const mid = Math.floor((begin + end)/2);
				if(right(this.arr[mid]))
					begin = mid + 1;
				else
					end = mid;
			}
			return begin;
		};
		
		if(
			!this.args.selectable ||
			!this.args.bounds ||
			this.selecting
		)
			return;
		
		this.arr.sort();
		this.begin = 
		this.anchor =
			binary_search(x => x < e.key);
		this.end = binary_search(x => x <= e.key);

		this.update_cursor();
		this.update_cell();
		e.preventDefault();
	}
	to_left(shift) {
		if(shift) {
			this.end = this.anchor;
			this.begin = 0;
		} else
			this.begin =
			this.end =
			this.anchor =
				0;
	}
	to_right(shift) {
		if(shift) {
			this.begin = this.anchor;
			this.end = 10;
		} else
			this.begin =
			this.end =
			this.anchor =
				10;
	}
	to_begin(e) {
		if(!this.args.movable || this.selecting)
			return;
		
		const shift = e && e.shiftKey && this.args.selectable;
		if(this.rtl)
			this.to_right(shift);
		else
			this.to_left(shift);
		
		this.update_cursor();
		if(e)
			e.preventDefault();
	}
	to_end(e) {
		if(!this.args.movable || this.selecting)
			return;
		
		const shift = e && e.shiftKey && this.args.selectable;
		if(this.rtl)
			this.to_left(shift);
		else
			this.to_right(shift);
		
		this.update_cursor();
		if(e)
			e.preventDefault();
	}
	all(e) {
		if(!this.args.selectable || this.selecting)
			return;
		
		this.begin = 0;
		this.end = 10;

		this.update_cursor();
		e.preventDefault();
	}
	reverse(e) {
		if(!this.args.reversible || this.selecting)
			return;
		
		this.rtl = !this.rtl;

		class_if(this.html.cursor, 'reverse', this.rtl);
		this.update_cursor();
		this.update_control();
		e.preventDefault();
	}
	event_pos(e) {
		const
			{ left, width } = this.html.grid.getBoundingClientRect(),
			rem = width/32.75,
			x = left + 0.125*rem,
			dx = 3.25*rem;
		return Math.max(0, Math.min(10, Math.round((e.clientX - x)/dx)));
	}
	click(e) {
		if(e.button != 0)
			return;
		
		this.selecting = true;
		this.begin =
		this.end =
		this.anchor =
			this.event_pos(e);
		
		this.update_cursor();
	}
	drag(e) {
		if(this.args.selectable) {
			const pos = this.event_pos(e);
			this.begin = Math.min(pos, this.anchor);
			this.end = Math.max(pos, this.anchor);
		} else
			this.begin =
			this.end =
			this.anchor =
				this.event_pos(e);
		
		this.update_cursor();
	}
	mouseup() {
		this.selecting = false;
	}
}

function attach_keyboard_input(target, list) {
	target.addEventListener('keydown', e => {
		for(const { keys, handler } of list)
			for(const key of keys) {
				const
					keylist = typeof key === 'string'
						? [key]
					: typeof key.key === 'string'
						? [key.key]
						: key.key,
					{ ctrl, alt, shift, meta } = {
						ctrl: false,
						alt: false,
						shift: false,
						meta: false,
						...typeof key === 'string' ? { key } : key
					};
				if(
					keylist.includes(e.key) &&
					(ctrl === undefined || ctrl === e.ctrlKey) &&
					(alt === undefined || alt === e.altKey) &&
					(shift === undefined || shift === e.shiftKey) &&
					(meta === undefined || meta === e.metaKey)
				)
					return handler(e);
			}
	});
}

function class_if(elem, ...args) {
	const
		list = elem.classList,
		len = args.length/2;
	for(let i = 0; i < len; i++) {
		const
			token = args[2*i],
			pred = args[2*i + 1];
		if(pred)
			list.add(token);
		else
			list.remove(token);
	}
}

document.addEventListener('mouseup', () =>
	Cursorbox.list.forEach(x => x.mouseup())
);

substitute((e, a) => new Cursorbox(e, a));

})();