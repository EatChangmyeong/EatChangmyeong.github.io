document.addEventListener('DOMContentLoaded', function() {
	var $ = document.querySelector.bind(document), $s = document.querySelectorAll.bind(document);

	var hlist = [].map.call($s('main h1, main h2, main h3, main h4, main h5, main h6'), function(x) {
		return {
			tag: x,
			level: +x.tagName[1]
		};
	}), minLevel = hlist.map(function(x) {
		return x.level;
	}).reduce(function(a, b) {
		return Math.min(a, b);
	});

	var divGen = function(list) {
		var internal = function(depth, shift) {
			var
				here = x, to,
				minLvl = Infinity, level = list[here].level, r = '',
				isLeaf = level == shift;

			r += '<div class="toc-node">';

			if(isLeaf) {
				r += '<a class="toc-leaf" href="#' + list[x].tag.id + '">';
					r += list[x].tag.textContent;
				r += '</a>';
				x++;
			}
			to = x;

			while(to < l && list[to].level - shift > 0) {
				minLvl = Math.min(minLvl, list[to].level);
				to++;
			}
			
			while(x < to)
				r += internal(depth + 1, minLvl);
			
			r += '</div>';
			return r;
		}, l = list.length, x = 0, r = '';

		while(x < l)
			r += internal(0, minLevel);
		return r;
	};

	// hlist.forEach(function(x) {
	// 	x.level -= minLevel;
	// });

	// $('.toc').innerHTML = hlist.map(function(x) {
	// 	return '<div class="toc-' + x.level + '"><a href="#' + x.tag.id + '">' + x.tag.textContent + '</a></div>'
	// }).join('');

	$('.toc').innerHTML = divGen(hlist);
});