---
layout: front
---

스파게티 CSS는 제가 전부 치웠습니다. 😉

[마크다운 문법 치트시트](/syntax)

[외부 리소스](/thirdparty)

## TODO

* 목차에서 지금 읽는 위치 하이라이트
* 페이지네이션
* 태그 클라우드?

# 글 목록

<ul id="post-list">
	{% for x in site.posts %}
		{% unless x.categories contains "Beta" %}
		<a href="{{ x.url }}">
			<li
				{% if x.cover_image %}
					style="background-image: url({{ x.cover_image }});"
				{% endif %}
			>
				<span class="post-list-title">
					<h2>{{ x.title }}</h2>
					<span class="metadata">
						<time class="date" datetime="{{ x.date | date: '%F' }}">{{ x.date | date: "%Y년 %m월 %d일" }}</time>
						{% for y in x.categories %}
							<span class="category">{{ y }}</span>
						{% endfor %}
						{% for y in x.tags %}
							<span class="tag">{{ y }}</span>
						{% endfor %}
					</span>
				</span>
			</li>
		</a>
		{% endunless %}
	{% endfor %}
</ul>