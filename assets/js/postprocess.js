(function() {

var $ = document.querySelector.bind(document), $s = document.querySelectorAll.bind(document);

var fnlist = {}, required = [];

function noop() {}

fnlist.tableOfContents = function() {
	var
		headingNodes = []
			.map.call($s('main h1, main h2, main h3, main h4, main h5, main h6'),
				function(x) { return {tag: x, level: +x.tagName[1]}; }),
		globalMinLevel = headingNodes
			.map(function(x) { return x.level; })
			.reduce(function(a, b) { return Math.min(a, b); });

	var generateToc = function(nodeList) {
		var generateToc_internal = function(depth, shift) {
			var
				here = scanPos, to,
				minLevel = Infinity, level = nodeList[here].level,
				result = '',
				isLeaf = level == shift;

			result += '<li>';

			if(isLeaf) {
				result +=
					'<a class="toc-leaf" href="#' + nodeList[scanPos].tag.id + '">' +
						nodeList[scanPos].tag.textContent +
					'</a>';
				scanPos++;
			}
			to = scanPos;

			while(to < length && nodeList[to].level - shift > 0) {
				minLevel = Math.min(minLevel, nodeList[to].level);
				to++;
			}
			
			if(scanPos < to) {
				result += '<ol>';
				while(scanPos < to)
					result += generateToc_internal(depth + 1, minLevel);
				result += '</ol>';
			}

			result += '</li>';
			return result;
		};
		
		var length = nodeList.length, scanPos = 0, result = '';

		while(scanPos < length)
			result += generateToc_internal(0, globalMinLevel);
		return '<ol>' + result + '</ol>';
	};

	$('.toc').innerHTML = generateToc(headingNodes);
};

fnlist.progressBar = function() {
	window.addEventListener('resize', progressBarResize);
	document.addEventListener('scroll', progressBarScroll);
	progressBarResize();
};

fnlist.topButton = function() {
	window.addEventListener('resize', topButtonUpdate);
	document.addEventListener('scroll', topButtonUpdate);
	topButtonUpdate();
};

function progressBarResize() {
	$('#progress-bar').style.display = innerHeight < document.body.scrollHeight ? '' : 'none';
	progressBarScroll();
}

function progressBarScroll() {
	$('#progress-bar').style.width = scrollY/(document.body.scrollHeight - innerHeight)*100 + '%';
}

function topButtonUpdate() {
	var activated = !!scrollY;
	$('#top-button').style.opacity = activated ? 1 : 0;
	$('#top-button').style.pointerEvents = activated ? '' : 'none';
}

window.require = function() {
	for(var i in arguments)
		if(arguments[i] in fnlist)
			required.push(fnlist[arguments[i]]);
};
window.requireAll = function() {
	for(var i in fnlist)
		required.push(fnlist[i]);
}

document.addEventListener('DOMContentLoaded', function() {
	for(var i in required)
		required[i]();
});

})();