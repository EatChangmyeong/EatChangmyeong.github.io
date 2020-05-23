(function() {

var $ = document.querySelector.bind(document), $s = document.querySelectorAll.bind(document);

function tableOfContents() {
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
}

function progressBar() {
	window.addEventListener('resize', progressBarResize);
	document.addEventListener('scroll', progressBarScroll);
	progressBarResize();
}

function progressBarResize() {
	$('#progress-bar').style.display = innerHeight < document.body.scrollHeight ? '' : 'none';
	progressBarScroll();
}

function progressBarScroll() {
	$('#progress-bar').style.width = scrollY/(document.body.scrollHeight - innerHeight)*100 + '%';
}

document.addEventListener('DOMContentLoaded', function() {
	tableOfContents();
	progressBar();
});

})();