---
layout: front
---

아직도 공사 중! CSS 끝나니까 눈에 띄는 변화가 적어지는 것 같은데 아직도 할 게 많네요.

[마크다운 문법 적어놓은 페이지](/syntax.html)

# 글 목록

<ul id="post-list">
	{% for x in site.posts %}
		<li>
			<span class="metadata">
				<span class="date">{{ x.date | date: "%Y년 %m월 %d일" }}</span>{% for y in x.tags %} <span class="tag">{{ y }}</span>{% endfor %}
			</span>
			<h2><a href="{{ x.url }}">{{ x.actual_title }}</a></h2>
			<p>
				{{ x.excerpt }}
			</p>
		</li>
	{% endfor %}
</ul>