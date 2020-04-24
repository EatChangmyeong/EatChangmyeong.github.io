---
layout: front
---

아직도 공사 중! 그동안 목차 UI 같은 소소한 거 때문에 애를 먹었습니다. 오랜만에 다시 잡으니까 다행히 진전이 되긴 하네요.

[마크다운 문법 적어놓은 페이지](/syntax.html)

# 글 목록

<ul id="post-list">
	{% for x in site.posts %}
		<li>
			<span class="metadata">
				<span class="date">{{ x.date | date: "%Y년 %m월 %d일" }}</span>
				{% for y in x.tags %}
					<span class="tag">{{ y }}</span>
				{% endfor %}
			</span>
			<h2><a href="{{ x.url }}">{{ x.actual_title }}</a></h2>
			<p>
				{{ x.excerpt }}
			</p>
		</li>
	{% endfor %}
</ul>