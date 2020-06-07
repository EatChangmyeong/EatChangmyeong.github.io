---
layout: pseudopost
actual_title: "마크다운 문법 <strong>치트시트</strong>"
date: 2020-04-24
permalink: /syntax/
---

제가 기억을 못 할 것 같아서 쓰는 페이지입니다. 이 블로그 기준으로 작성되어 있으니 참고할 때 주의해주세요!

# 목차 (kramdown 확장)

1. 제물로 바쳐질 ol
{:toc}

```
1. 제물로 바쳐질 ol
{:toc}
```

# 헤더

# H1
## H2
### H3
#### H4
##### H5
###### H6

```
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

## 커스텀 ID (kramdown 확장)

#### Another H4 {#with_custom_id}

```
#### Another H4 {#with_custom_id}
```

# 글자 효과

**굵게**, *기울임체*, ***굵은 기울임체***

__굵게__, _기울임체_, ___굵은 기울임체___

~~취소선~~

```
**굵게**, *기울임체*, ***굵은 기울임체***

__굵게__, _기울임체_, ___굵은 기울임체___

~~취소선~~
```

# 리스트

* 순서 없는
* 리스트
	- 속 리스트
		* 속 리스트

1. 순서 있는
3. 리스트
	5. 번호는
		8. 무조건 1번부터

```
* 순서 없는
* 리스트
	- 속 리스트
		* 속 리스트

1. 순서 있는
3. 리스트
	5. 번호는
		8. 무조건 1번부터
```

# 링크

[링크 텍스트](https://eatch.dev "툴팁")

자동링크 <https://eatch.dev/> <example@example.com> (<eatch.dev>는 안됨)

```
[링크 텍스트](https://eatch.dev "툴팁")

자동링크 <https://eatch.dev/> <example@example.com> (<eatch.dev>는 안됨)
```

# 이미지

![알트텍스트](https://eatch.dev/ei/-0-f "툴팁")

\![이건 이미지가 아니라 느낌표랑 링크로 취급합니다.](https://eatch.dev/ei/-0-f)

```
![알트텍스트](https://eatch.dev/ei/-0-f "툴팁")

\![이건 이미지가 아니라 느낌표랑 링크로 취급합니다.](https://eatch.dev/ei/-0-f)
```

# 인용문

> 1단계 인용문
> > 2단계 인용문

```
> 1단계 인용문
> > 2단계 인용문
```

# 인라인 코드

`마크다운` `인라인 코드`

```
`마크다운` `인라인 코드`
```

# 코드 블록

	들여쓰기 스타일 코드

```
백틱 스타일 코드
```

````
백틱 더많이
```
```
````

```javascript
console.log('Code block with syntax highlighting!');
console.info('코드 테마는 무난하게 Monokai를 썼습니다.');
```

`````
	들여쓰기 스타일 코드

```
백틱 스타일 코드
```

````
백틱 더많이
```
```
````

```javascript
console.log('Code block with syntax highlighting!');
console.info('코드 테마는 무난하게 Monokai를 썼습니다.');
```
`````

## 줄 번호가 있는 코드 블록 (리퀴드 확장)

{% highlight javascript linenos %}
String.raw`왼쪽에 줄 번호가 있다!
언어 이름을 반드시 명시해야 합니다.
왜 마크다운 문법으로는 줄 번호가 안 나와 개빢쵸
지금 보니까 리퀴드 문법에 raw가 있네 으`
{% endhighlight %}

```
{% raw %}{% highlight javascript linenos %}
String.raw`왼쪽에 줄 번호가 있다!
언어 이름을 반드시 명시해야 합니다.
왜 마크다운 문법으로는 줄 번호가 안 나와 개빢쵸
지금 보니까 리퀴드 문법에 raw가 있네 으`
{% endhighlight %}{% endraw %}
```

# 테이블

| THEAD | area |
| ----- | ---- |
| TBODY | area |
| multiline | text |
| multiline | text |
| multiline | text |
| multiline | text |
| ===== | ==== |
| TFOOT | area |

| THEAD and TFOOT are optional! |

| align | align  | align |
| ----: | :----: | :---- |
| right | center | left |
| ====: | :====: | :==== |
| align | align  | align |

```
| THEAD | area |
| ----- | ---- |
| TBODY | area |
| multiline | text |
| multiline | text |
| multiline | text |
| multiline | text |
| ===== | ==== |
| TFOOT | area |

| THEAD and TFOOT are optional! |

| align | align  | align |
| ----: | :----: | :---- |
| right | center | left |
| ====: | :====: | :==== |
| align | align  | align |
```

# 체크박스

* [ ] 체크 안 된 체크박스
* [x] 체크된 체크박스

```
* [ ] 체크 안 된 체크박스
* [x] 체크된 체크박스
```

# 가로선

***

*****

* * *

---

-----

- - -

```
***

*****

* * *

---

-----

- - -
```

# 각주

각주 문법 데모[^fn1]입니다. 각주 내용은 글의 맨 아래에 있습니다.

똑같은 주석을 여러 번 쓸 수 있습니다. [^fnrepeat] & [^fnrepeat]

[^fn1]: 각주 내용입니다. **굵은 글씨**

[^fnrepeat]: 각주 아이디는 한글로 못 씁니다. 아쉽다

```
각주 문법 데모[^fn1]입니다. 각주 내용은 글의 맨 아래에 있습니다.

똑같은 주석을 여러 번 쓸 수 있습니다. [^fnrepeat] & [^fnrepeat]

[^fn1]: 각주 내용입니다. **굵은 글씨**

[^fnrepeat]: 각주 아이디는 한글로 못 씁니다. 아쉽다
```

# 설명 목록 (kramdown 확장)

아무 단어

: 콜론과 본문은 한 칸 띄어써야 합니다.

다른 단어

: 다람쥐 헌 쳇바퀴에 타고파.

```
아무 단어

: 콜론과 본문은 한 칸 띄어써야 합니다.

다른 단어

: 다람쥐 헌 쳇바퀴에 타고파.
```

# 수식 (kramdown + MathJax 확장)

## 인라인 수식

$ 두 개로 감싸서 수식을 표시합니다. $$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$

↓ 강제 인라인 수식

\$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$

```
$ 두 개로 감싸서 수식을 표시합니다. $$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$

↓ 강제 인라인 수식

\$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
```

## 블록 수식
별도의 줄에 작성해야 합니다.

$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$

```
별도의 줄에 작성해야 합니다.

$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
```