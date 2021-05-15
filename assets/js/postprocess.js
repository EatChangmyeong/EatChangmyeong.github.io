{

const
	$ = q => document.querySelector(q),
	$s = q => [...document.querySelectorAll(q)];

const
	features = {
		table_of_contents() {
			function split_by_level(nodes, level) {
				const split_list = [];
				for(const x of nodes) {
					if(!split_list.length || x.level <= level)
						split_list.push([]);
					split_list[split_list.length - 1].push(x);
				}
				return split_list;
			}
			function toc_leaf(node) {
				const a = document.createElement('a');
				a.className = 'toc-leaf';
				a.href = `#${node.tag.id}`;
				a.textContent = node.tag.textContent;
				return a;
			}
			function toc_from(nodes, level = 1) {
				const split = split_by_level(nodes, level);
				if(split.length === 1 && split[0][0].level !== level)
					return toc_from(split[0], level + 1);
				
				const ol = document.createElement('ol');
				split.forEach(x => {
					const li = document.createElement('li');
					if(x[0].level === level) {
						li.appendChild(toc_leaf(x[0]));
						x = x.slice(1);
					}
					if(x.length)
						li.appendChild(toc_from(x, level + 1));
					ol.appendChild(li);
				});
				return ol;
			}

			$('.toc').appendChild(
				toc_from(
					$s(
						[...Array(6)]
							.map((_, i) => `main h${i + 1}`)
							.join(', ')
					)
						.map(tag => ({ tag, level: +tag.tagName[1] }))
				)
			);
		},
		table_of_contents_new() {
			function split_by_level(nodes, level) {
				const split_list = [];
				for(const x of nodes) {
					if(!split_list.length || x.level <= level)
						split_list.push([]);
					split_list[split_list.length - 1].push(x);
				}
				return split_list;
			}
			function toc_leaf(node) {
				const a = document.createElement('a');
				a.className = 'toc-leaf';
				a.href = `#${node.tag.id}`;
				a.textContent = node.tag.textContent;
				return a;
			}
			function toc_from(nodes, level = 1) {
				const split = split_by_level(nodes, level);
				if(split.length === 1 && split[0][0].level !== level)
					return toc_from(split[0], level + 1);
				
				const ol = document.createElement('ol');
				split.forEach(x => {
					const li = document.createElement('li');
					if(x[0].level === level) {
						li.appendChild(toc_leaf(x[0]));
						x = x.slice(1);
					}
					if(x.length)
						li.appendChild(toc_from(x, level + 1));
					ol.appendChild(li);
				});
				return ol;
			}

			$('.toc').appendChild(
				toc_from(
					$s(
						[...Array(6)]
							.map((_, i) => `article h${i + 1}`)
							.join(', ')
					)
						.map(tag => ({ tag, level: +tag.tagName[1] }))
				)
			);
		},
		progress_bar() {
			function resize() {
				$('#progress-bar').style.display =
					window.innerHeight < document.body.scrollHeight
						? ''
						: 'none';
				scroll();
			}
			function scroll() {
				const scroll_len = document.body.scrollHeight - window.innerHeight;
				$('#progress-bar').style.width = window.scrollY/scroll_len*100 + '%';
			}

			window.addEventListener('resize', resize);
			document.addEventListener('scroll', scroll);
			resize();
		},
		top_button() {
			function update() {
				const activated = !!window.scrollY;
				$('#top-button').style.opacity = 0.5*activated;
				$('#top-button').style.pointerEvents = activated
					? ''
					: 'none';
			}

			window.addEventListener('resize', update);
			document.addEventListener('scroll', update);
			update();
		}
	},
	enabled = [];

window.require = (...args) => {
	for(const x of args)
		if(x in features)
			enabled.push(features[x]);
};
window.require_all = () => {
	window.require(...Object.keys(features).filter(x => x !== 'table_of_contents_new'));
};
window.require_all_new = () => {
	window.require(...Object.keys(features).filter(x => x !== 'table_of_contents'));
};

document.addEventListener('DOMContentLoaded', () =>
	enabled.forEach(x =>
		x()
	)
);

}