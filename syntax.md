---
layout: pseudopost
actual_title: "마크다운 문법 <strong>치트시트</strong>"
date: 2020-04-24
permalink: /syntax/
---

제가 기억을 못 할 것 같아서 쓰는 페이지입니다. 이 블로그 기준으로 작성되어 있으니 참고할 때 주의해주세요!

최종 출력은 왼쪽에, 마크다운 코드는 오른쪽에 배치되어 있습니다.

# 목차 (kramdown 확장)

*목차를 생성하려면 ul 혹은 ol을 생성한 뒤 다음 줄에 {:toc}을 추가해야 합니다. 제물로 바쳐지는 리스트는 사라집니다.*

*현재 이 블로그에 적용된 스타일시트상에서는 ul과 ol이 똑같이 표시됩니다. 이 문법은 kramdown에 있는 기능이길래 스타일시트 구현 + 이 페이지에 등록만 해 두었고, 실질적으로 쓸 계획은 없기 때문에 이대로 둘 예정입니다.*

<div class="split">
<div class="split-column">
* 
{:toc}
</div>
<div class="split-column">
```
1. 
{:toc}
```
</div>
</div>

# 헤더

<div class="split">
<div class="split-column">
# H1
</div>
<div class="split-column">
```
# H1
```
</div>

<div class="split-column">
## H2
</div>
<div class="split-column">
```
## H2
```
</div>

<div class="split-column">
### H3
</div>
<div class="split-column">
```
### H3
```
</div>

<div class="split-column">
#### H4
</div>
<div class="split-column">
```
#### H4
```
</div>

<div class="split-column">
##### H5
</div>
<div class="split-column">
```
##### H5
```
</div>

<div class="split-column">
###### H6
</div>
<div class="split-column">
```
###### H6
```
</div>
</div>

## 커스텀 ID (kramdown 확장)

*마크다운 엔진에서 임의로 부여하는 ID를 변경할 수 있습니다.*

<div class="split">
<div class="split-column">
#### Another H4 {#with_custom_id}
</div>
<div class="split-column">
```
#### Another H4 {#with_custom_id}
```
</div>
</div>

# 글자 효과

*<span style="text-decoration: underline;">기울임꼴</span>은 마크다운/kramdown 문법상에서 지원되지 않으며, 인라인 CSS를 사용해야 합니다.*

<div class="split">
<div class="split-column">
**굵게**, *기울임체*, ***굵은 기울임체***
</div>
<div class="split-column">
```
**굵게**, *기울임체*, ***굵은 기울임체***
```
</div>

<div class="split-column">
__굵게__, _기울임체_, ___굵은 기울임체___
</div>
<div class="split-column">
```
__굵게__, _기울임체_, ___굵은 기울임체___
```
</div>

<div class="split-column">
~~취소선~~
</div>
<div class="split-column">
```
~~취소선~~
```
</div>
</div>

# 리스트

<div class="split">
<div class="split-column">
* 순서 없는
* 리스트
	- 속 리스트
		* 속 리스트
</div>
<div class="split-column">
```
* 순서 없는
* 리스트
	- 속 리스트
		* 속 리스트
```
</div>

<div class="split-column">
1. 순서 있는
3. 리스트
	5. 번호는
		8. 무조건 1번부터
</div>
<div class="split-column">
```
1. 순서 있는
3. 리스트
	5. 번호는
		8. 무조건 1번부터
```
</div>
</div>

# 링크

<div class="split">
<div class="split-column">
[링크 텍스트](https://eatch.dev "툴팁")
</div>
<div class="split-column">
```
[링크 텍스트](https://eatch.dev "툴팁")
```
</div>

*<...> 안에 scheme이 포함된 주소나 이메일 주소를 입력하면 오토링크가 걸립니다. <...> 없이 주소만 입력하면 변환되지 않습니다.*

<div class="split-column">
<https://eatch.dev/> <example@example.com>

cf. https://eatch.dev/ example@example.com
</div>
<div class="split-column">
```
<https://eatch.dev/> <example@example.com>

cf. https://eatch.dev/ example@example.com
```
</div>
</div>

# 이미지

<div class="split">
<div class="split-column">
![알트텍스트](https://eatch.dev/ei/-0-f "툴팁")
</div>
<div class="split-column">
```
![알트텍스트](https://eatch.dev/ei/-0-f "툴팁")
```
</div>

<div class="split-column">
\![이건 이미지가 아니라 느낌표랑 링크로 취급합니다.](https://eatch.dev/ei/-0-f)
</div>
<div class="split-column">
```
\![이건 이미지가 아니라 느낌표랑 링크로 취급합니다.](https://eatch.dev/ei/-0-f)
```
</div>
</div>

# 인용문

<div class="split">
<div class="split-column">
> 1단계 인용문
> > 2단계 인용문
</div>
<div class="split-column">
```
> 1단계 인용문
> > 2단계 인용문
```
</div>
</div>

# 인라인 코드

<div class="split">
<div class="split-column">
`마크다운` `인라인 코드`
</div>
<div class="split-column">
```
`마크다운` `인라인 코드`
```
</div>
</div>

# 코드 블록

<div class="split">
<div class="split-column">
	들여쓰기 스타일 코드
</div>
<div class="split-column">
```
	들여쓰기 스타일 코드
```
</div>

<div class="split-column">
```
백틱 스타일 코드 ("Fenced")
```
</div>
<div class="split-column">
````
```
백틱 스타일 코드 ("Fenced")
```
````
</div>

*백틱 스타일 코드 블록 안쪽에 백틱을 3개 이상 넣어야 할 경우 바깥쪽의 백틱 수를 늘리면 됩니다. 코드 시작 부분보다 적은 수의 백틱이 나오면 코드 블록의 끝으로 인식하지 않습니다.*

<div class="split-column">
````
백틱 더많이
```
```
````
</div>
<div class="split-column">
`````
````
백틱 더많이
```
```
````
`````
</div>

<div class="split-column">
```javascript
console.log('Code block with syntax highlighting!');
console.info('코드 테마는 무난하게 Monokai를 썼습니다.');
```
</div>
<div class="split-column">
````
```javascript
console.log('Code block with syntax highlighting!');
console.info('코드 테마는 무난하게 Monokai를 썼습니다.');
```
````
</div>
</div>

## 줄 번호가 있는 코드 블록 (리퀴드 확장)

*이상하게 table은 flex를 적용해도 내용물 이상으로 줄어들지 않네요... 아래쪽 [테이블](#테이블)에서도 똑같은 문제가 생기고 있는데(창 크기를 충분히 줄이면 깨짐) 일단 이 페이지 바깥에서는 문제가 없으니 당장 고치지는 않겠지만 혹시 이 부분만 해결하고 풀리퀘 보내주신다면 대환영입니다 감사합니다* 🙇‍♂️

<div class="split">
<div class="split-column">
{% highlight javascript linenos %}
String.raw`왼쪽에 줄 번호가 있다!
언어 이름을 반드시 명시해야 합니다.
왜 마크다운 문법으로는 줄 번호가 안 나와 개빢쵸
지금 보니까 리퀴드 문법에 raw가 있네 으`
{% endhighlight %}
</div>
<div class="split-column">
```
{% raw %}{% highlight javascript linenos %}
String.raw`왼쪽에 줄 번호가 있다!
언어 이름을 반드시 명시해야 합니다.
왜 마크다운 문법으로는 줄 번호가 안 나와 개빢쵸
지금 보니까 리퀴드 문법에 raw가 있네 으`
{% endhighlight %}{% endraw %}
```
</div>
</div>

# 테이블

*테이블은 단독으로 한 문단을 이루어야 합니다[^fn_paragraph].*

<div class="split">
<div class="split-column">
| This | is      | THEAD |
| ---- | --      | ----- |
| This | is      | TBODY |
| This | is also | TBODY |
| ==== | ==      | ===== |
| This | is      | TFOOT |

</div>
<div class="split-column">
```
| This | is      | THEAD |
| ---- | --      | ----- |
| This | is      | TBODY |
| This | is also | TBODY |
| ==== | ==      | ===== |
| This | is      | TFOOT |
```
</div>

<div class="split-column">
| THEAD랑 TFOOT은 꼭 안 넣어도 돼요! |

</div>
<div class="split-column">
```
| THEAD랑 TFOOT은 꼭 안 넣어도 돼요! |
```
</div>

<div class="split-column">
| 왼쪽 | 가운데 | 오른쪽 |
| -: | :--: | :- |
| 왼쪽 | 가운데 | 오른쪽 |
| =: | :==: | := |
| 왼쪽 | 가운데 | 오른쪽 |

</div>
<div class="split-column">
```
| 왼쪽 | 가운데 | 오른쪽 |
| -: | :--: | :- |
| 왼쪽 | 가운데 | 오른쪽 |
| =: | :==: | := |
| 왼쪽 | 가운데 | 오른쪽 |
```
</div>
</div>

# 체크박스

<div class="split">
<div class="split-column">
* [ ] 체크 안 된 체크박스
* [x] 체크된 체크박스
</div>
<div class="split-column">
```
* [ ] 체크 안 된 체크박스
* [x] 체크된 체크박스
```
</div>
</div>

# 가로선

*한 줄에 별표(\*), 대시(-), 밑줄(_) 중 하나만이 3개 이상 있으면 가로선으로 취급됩니다. 최대 개수 제한은 없으며, 각 문자 사이에 임의의 개수의 띄어쓰기를 추가할 수 있습니다. 첫 문자 앞에는 띄어쓰기 3개까지만 허용되며, 그렇지 않을 경우 코드 블록으로 취급됩니다.*

<div class="split">
<div class="split-column">
***

*****

* * *

-  -  -

   -      -  -

___
</div>
<div class="split-column">
```
***

*****

* * *

-  -  -

   -      -  -

___
```
</div>
</div>

# 각주

*각주 아이디는 클릭 시 URL로 노출됩니다.*

<div class="split">
<div class="split-column">
각주 문법 데모[^fn1]입니다. 각주 내용은 글의 맨 아래에 있습니다.

[^fn1]: 각주 내용입니다. **마크다운 문법**도 쓸 수 있습니다.
</div>
<div class="split-column">
```
각주 문법 데모[^fn1]입니다. 각주 내용은 글의 맨 아래에 있습니다.

[^fn1]: 각주 내용입니다. **마크다운 문법**도 쓸 수 있습니다.
```
</div>

<div class="split-column">
똑같은 주석을 여러 번 쓸 수 있습니다. [^fnrepeat] & [^fnrepeat]

[^fnrepeat]: 각주 아이디는 한글로 못 씁니다. 아쉽다
</div>
<div class="split-column">
```
똑같은 주석을 여러 번 쓸 수 있습니다. [^fnrepeat] & [^fnrepeat]

[^fnrepeat]: 각주 아이디는 한글로 못 씁니다. 아쉽다
```
</div>
</div>

# 설명 목록 (kramdown 확장)

<div class="split">
<div class="split-column">
아무 단어

: 콜론과 본문은 한 칸 띄어써야 합니다.

다른 단어

: 다람쥐 헌 쳇바퀴에 타고파.
</div>
<div class="split-column">
```
아무 단어

: 콜론과 본문은 한 칸 띄어써야 합니다.

다른 단어

: 다람쥐 헌 쳇바퀴에 타고파.
```
</div>
</div>

# 수식 (kramdown + MathJax 확장)

*수식이 단독으로 한 문단을 이루면[^fn_paragraph] 블록 수식, 그렇지 않으면 인라인 수식이 됩니다.*

## 인라인 수식

<div class="split">
<div class="split-column">
$ 두 개로 감싸서 수식을 표시합니다. $$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
</div>
<div class="split-column">
```
$ 두 개로 감싸서 수식을 표시합니다. $$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
```
</div>

<div class="split-column">
강제 인라인 수식:

\$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$

</div>
<div class="split-column">
```
강제 인라인 수식:

\$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
```
</div>
</div>

*kramdown 문서에는 `\$\$...$$` 문법을 사용하면 수식으로 변환되지 않는다고 명시되어 있지만, 이 블로그에서는 작동하지 않습니다.*

## 블록 수식

<div class="split">
<div class="split-column">
$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$

</div>
<div class="split-column">
```
$$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
```
</div>
</div>

[^fn_paragraph]: 어떤 콘텐츠의 바로 아래에 빈 줄이 있으면 그 아래의 콘텐츠와 분리되어 "한 문단"이 됩니다.