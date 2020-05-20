---
layout: front
---

일단 이 정도면 공개는 해도 괜찮을 것 같네요! 아직 완성된 건 아닌데 생각날 때마다 차차 추가해야죠

[마크다운 문법 치트시트](/syntax)

[외부 리소스](/thirdparty-license)

## TODO

* 목차에서 지금 읽는 위치 하이라이트
* 맨 위로 돌아가기
* 페이지네이션
* 태그 클라우드?
* DISQUS 댓글창

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