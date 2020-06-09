---
layout: front
---

블로그 개발은 일단 잘 되고 있습니다. CSS가 엉망이 되긴 했는데...

[마크다운 문법 치트시트](/syntax)

[외부 리소스](/thirdparty-license)

## TODO

* 목차에서 지금 읽는 위치 하이라이트
* 페이지네이션
* 태그 클라우드?
* DISQUS 댓글창

# 글 목록

<ul id="post-list">
	{% for x in site.posts %}
		{% unless x.categories contains "Beta" %}
		<li>
			<span class="metadata">
				<span class="date">{{ x.date | date: "%Y년 %m월 %d일" }}</span>
				{% for y in x.categories %}
					<span class="category">{{ y }}</span>
				{% endfor %}
				{% for y in x.tags %}
					<span class="tag">{{ y }}</span>
				{% endfor %}
			</span>
			<h2><a href="{{ x.url }}">{{ x.actual_title }}</a></h2>
			<p>
				{{ x.excerpt }}
			</p>
		</li>
		{% endunless %}
	{% endfor %}
</ul>