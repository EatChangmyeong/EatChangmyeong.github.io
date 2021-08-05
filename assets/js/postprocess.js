(() => {

function table_of_contents() {
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
		for(let x of split) {
			const li = document.createElement('li');
			if(x[0].level === level) {
				li.appendChild(toc_leaf(x[0]));
				x = x.slice(1);
			}
			if(x.length)
				li.appendChild(toc_from(x, level + 1));
			ol.appendChild(li);
		}
		return ol;
	}

	document.getElementsByClassName('toc')[0]
		.appendChild(
			toc_from(
				[...document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6')]
					.map(tag => ({ tag, level: +tag.tagName[1] }))
			)
		);
}

function progress_bar() {
	const
		end_of_post = document.getElementById('end-of-post'),
		progress_bar = document.getElementById('progress-bar');
	function article_height() {
		return end_of_post.offsetTop;
	}
	function resize() {
		progress_bar.style.display =
			window.innerHeight < article_height()
				? ''
				: 'none';
		scroll();
	}
	function scroll() {
		const
			scroll_len = article_height() - window.innerHeight,
			progress = Math.min(1, window.scrollY/scroll_len);
		progress_bar.style.width =
			`${100*progress}%`;
		if(progress == 1)
			progress_bar.classList.add('complete');
		else
			progress_bar.classList.remove('complete');
	}

	if(window.ResizeObserver)
		new ResizeObserver(scroll).observe(document.getElementsByTagName('main')[0]);
	window.addEventListener('resize', resize);
	document.addEventListener('scroll', scroll);
	resize();
}

function top_button() {
	function update() {
		const
			activated = !!window.scrollY,
			top_button = document.getElementById('top-button');
		top_button.style.opacity = 0.5*activated;
		top_button.style.pointerEvents = activated
			? ''
			: 'none';
	}

	window.addEventListener('resize', update);
	document.addEventListener('scroll', update);
	update();
}

const
	features = {
		table_of_contents,
		progress_bar,
		top_button
	},
	enabled = [];

window.require = (...args) => {
	for(const x of args)
		if(x in features)
			enabled.push(features[x]);
};
window.require_all = () => {
	window.require(...Object.keys(features));
};

document.addEventListener('DOMContentLoaded', () => {
	for(const x of enabled)
		x();
});

})();