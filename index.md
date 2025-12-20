---
layout: front
---

[마크다운 문법 치트시트](/syntax)

[외부 리소스](/thirdparty)

[Atom 피드](/feed.xml)

[소스 코드 확인해보기](https://github.com/EatChangmyeong/EatChangmyeong.github.io)

# 글 목록

<ul id="post-list">
	{% for x in site.posts %}
		{% unless x.categories contains "Beta" %}
		<a href="{{ x.url }}">
			<li
				{% if x.image %}
					style="background-image: url({{ x.image }});"
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