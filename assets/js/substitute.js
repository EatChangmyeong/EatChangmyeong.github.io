function substitute(f) {
	document.addEventListener('DOMContentLoaded', () => {
		for(const x of document.querySelectorAll('main article div[data-script]')) {
			try {
				const arg = JSON.parse(x.dataset.script);
				f(x, arg);
			} catch(e) {
				x.dataset.error = '';
				const
					frag = document.createDocumentFragment(),
					headline = document.createElement('p'),
					failed = document.createElement('span'),
					msg = document.createElement('span'),
					next_step = document.createElement('p');
				failed.className = 'script-fail';
				failed.textContent = '스크립트 실행 중 오류가 발생했습니다.'
				headline.appendChild(failed);
				headline.appendChild(document.createTextNode(' '));
				msg.className = 'error-msg';
				msg.textContent = e.message;
				headline.appendChild(msg);
				frag.appendChild(headline);
				if('stack' in e) {
					const stack = document.createElement('pre');
					stack.className = 'backtrace';
					stack.textContent = e.stack;
					frag.appendChild(stack);
				}
				next_step.textContent = '구 버전 브라우저로 글을 읽고 있다면 최신 브라우저로 글을 읽어 주세요. 그래도 오류가 계속된다면 dlaud5379@naver.com이나 댓글창으로 알려주세요.'
				frag.appendChild(next_step);
				x.appendChild(frag);

				console.error(e);
			}
		}
	});
}