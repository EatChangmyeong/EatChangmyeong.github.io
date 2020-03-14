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

	hlist.forEach(function(x) {
		x.level -= minLevel;
	});

	$('.toc').innerHTML = hlist.map(function(x) {
		return '<div class="toc-' + x.level + '"><a href="#' + x.tag.id + '">' + x.tag.textContent + '</a></div>'
	}).join('');
});