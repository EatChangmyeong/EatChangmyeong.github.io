---
layout: pseudopost
actual_title: "마크다운 문법 <strong>치트시트</strong>"
date: 2020-04-24
permalink: /syntax/
---

제가 기억을 못 할 것 같아서 쓰는 페이지입니다. 이 블로그 기준으로 작성되어 있으니 참고할 때 주의해주세요!

최종 출력은 왼쪽에, 마크다운 코드는 오른쪽에 배치되어 있습니다.

# 혹시 몰라서 추가하는 외부 링크

* [GitHub Flavored Markdown 스펙](https://github.github.com/gfm/)
* [kramdown 문법](https://kramdown.gettalong.org/syntax.html)

# 목차 (kramdown 확장)

*목차를 생성하려면 ul 혹은 ol을 생성한 뒤 다음 줄에 {:toc}을 추가해야 합니다. 제물로 바쳐지는 리스트는 사라집니다.*

*현재 이 블로그에 적용된 스타일시트상에서는 ul과 ol로 생성한 목차가 똑같이 표시됩니다. 이 문법은 kramdown에 있는 기능이길래 스타일시트 구현 + 이 페이지에 등록만 해 두었고, 실질적으로 쓸 계획은 없기 때문에 이대로 둘 예정입니다.*

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

# 기본 요소

## 헤더

### Setext 스타일

*H1 및 H2만 지원합니다.*

<div class="split">
<div class="split-column">
Setext 스타일 H1
================
</div>
<div class="split-column">
```
Setext 스타일 H1
================
```
</div>

<div class="split-column">
Setext 스타일 H2
----------------
</div>
<div class="split-column">
```
Setext 스타일 H2
----------------
```
</div>
</div>

### atx 스타일

*H1부터 H6까지를 모두 지원합니다. 목차를 더 망가뜨리기 싫어서 H3까지는 생략했습니다.*

<div class="split">
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

### 커스텀 ID (kramdown 확장)

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

## 글자 효과

*<span style="text-decoration: underline;">밑줄</span>은 마크다운/kramdown 문법상에서 지원되지 않으며, 인라인 CSS나 [밑줄 커스텀 문법](#밑줄)을 사용해야 합니다.*

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

# 구조적 요소

## 리스트

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

<div class="split-column">
* 
		리스트 내부에 다른 요소가 올 수 있습니다.
</div>
<div class="split-column">
```
* 
		리스트 내부에 다른 요소가 올 수 있습니다.
```
</div>
</div>

## 설명 목록 (kramdown 확장)

<div class="split">
<div class="split-column">
아무 단어
: 콜론과 본문은 한 칸 띄어써야 합니다.

다른 단어
: 다람쥐 헌 쳇바퀴에 타고파.
: 설명을 여러 개 작성할 수 있습니다.
</div>
<div class="split-column">
```
아무 단어
: 콜론과 본문은 한 칸 띄어써야 합니다.

다른 단어
: 다람쥐 헌 쳇바퀴에 타고파.
: 설명을 여러 개 작성할 수 있습니다.
```
</div>
</div>

## 인용문

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

## 코드 블록

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

<div class="split-block">
*코드 블록 내부에 ```` ``` ````과 같이 연속된 백틱을 삽입하려면 둘러싸는 백틱의 수를 늘리면 됩니다. 이는 아래의 인라인 코드에도 동일하게 적용됩니다. 탈출 문자(``\` ``)는 사용할 수 없습니다.*
</div>

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

### 줄 번호가 있는 코드 블록 (리퀴드 확장)

<div class="split">
<div class="split-column">
{% highlight javascript linenos %}
String.raw`왼쪽에 줄 번호가 있다!
언어 이름을 반드시 명시해야 합니다.
예전에는 여기 좀 경박한 단어를 썼었는데 좀 수정하자면... 어차피 안 쓸 기능이긴 한데 공은 제일 많이 들인 것 같은 느낌이네요 으`
{% endhighlight %}
</div>
<div class="split-column">
```
{% raw %}{% highlight javascript linenos %}
String.raw`왼쪽에 줄 번호가 있다!
언어 이름을 반드시 명시해야 합니다.
예전에는 여기 좀 경박한 단어를 썼었는데 좀 수정하자면... 어차피 안 쓸 기능이긴 한데 공은 제일 많이 들인 것 같은 느낌이네요 으`
{% endhighlight %}{% endraw %}
```
</div>
</div>

## 테이블

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

## 가로선

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

## 수식 (kramdown + MathJax 확장)

*수식이 단독으로 한 문단을 이루면[^fn_paragraph] 블록 수식, 그렇지 않으면 인라인 수식이 됩니다.*

### 인라인 수식

<div class="split">
<div class="split-column">
인라인 수식: $$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
</div>
<div class="split-column">
```
인라인 수식: $$\sum_{i=0}^n i^2 = \frac{n(n+1)(2n+1)}{6}$$
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

### 블록 수식

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

## HTML 태그

<div class="split">
<div class="split-column">
<button>버튼</button>
</div>
<div class="split-column">
```
<button>버튼</button>
```
</div>

<div class="split-column">
<span style="background-color: rgba(171, 148, 252, 0.25);">태그 안에서도 *마크다운 문법*을 사용할 수 있도록 설정되어 있습니다.</span>
</div>
<div class="split-column">
```
<span style="background-color: rgba(171, 148, 252, 0.25);">태그 안에서도 *마크다운 문법*을 사용할 수 있도록 설정되어 있습니다.</span>
```
</div>

<div class="split-column">
<span style="background-color: rgba(171, 148, 252, 0.25);" markdown="0">markdown="0" 속성을 추가해 마크다운 문법을 *강제로 해제*할 수 있습니다.</span>
</div>
<div class="split-column">
```
<span style="background-color: rgba(171, 148, 252, 0.25);" markdown="0">markdown="0" 속성을 추가해 마크다운 문법을 *강제로 해제*할 수 있습니다.</span>
```
</div>
</div>

# 인라인 마크업

## 링크

<div class="split">
<div class="split-column">
[링크 텍스트](https://eatch.dev "툴팁")
</div>
<div class="split-column">
```
[링크 텍스트](https://eatch.dev "툴팁")
```
</div>

<div class="split-column">
[별도 정의를 사용하는 링크][ref-style-link]

[ref-style-link]: https://eatch.dev/ "여기도 툴팁을 넣을 수 있습니다."
</div>
<div class="split-column">
```
[별도 정의를 사용하는 링크][ref-style-link]

[ref-style-link]: https://eatch.dev/ "여기도 툴팁을 넣을 수 있습니다."
```
</div>

<div class="split-block">
*<...> 안에 scheme이 포함된 주소나 이메일 주소를 입력하면 오토링크가 걸립니다. <...> 없이 주소만 입력하면 변환되지 않습니다.*
</div>

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

## 이미지

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

## 인라인 코드

<div class="split">
<div class="split-column">
`마크다운` `인라인 코드`
</div>
<div class="split-column">
```
`마크다운` `인라인 코드`
```
</div>

<div class="split-column">
``haha `backticks` go brrrr``
</div>
<div class="split-column">
```
``haha `backticks` go brrrr``
```
</div>

<div class="split-column">
`const x = "문법 하이라이팅이 되는 인라인 코드";`{:.language-javascript}
</div>
<div class="split-column">
```
`const x = "문법 하이라이팅이 되는 인라인 코드";`{:.language-javascript}
```
</div>
</div>

*문법 하이라이팅에 사용한 문법에 대한 자세한 설명은 [인라인 속성 목록](#인라인-속성-목록-kramdown-확장)에서 확인할 수 있습니다.*

## 체크박스

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

## 각주

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

## 축약어 정의 (kramdown 확장)

<div class="split">
<div class="split-column">
잇넘귀 잇넘귀 신나는 노래

*[잇넘귀]: 잇창명 너무 귀엽다
</div>
<div class="split-column">
```
잇넘귀 잇넘귀 신나는 노래

*[잇넘귀]: 잇창명 너무 귀엽다
```
</div>
</div>

# 기타 문법

## 블록 분리 (kramdown 확장)

*^ 문자를 이용해 블록 단위 문법을 분리할 수 있습니다.*

<div class="split">
<div class="split-column">
1. 리스트 1
^
1. 리스트 2
</div>
<div class="split-column">
```
1. 리스트 1
^
1. 리스트 2
```
</div>

<div class="split-column">
	코드 블록 1
^
	코드 블록 2
</div>
<div class="split-column">
```
	코드 블록 1
^
	코드 블록 2
```
</div>
</div>

## 속성 목록 정의 (kramdown 확장)

*아래와 같은 문법을 사용해 특정한 문자열에 id, 클래스, HTML 속성을 대응시킬 수 있습니다. 이렇게 정의한 속성 목록은 아래의 인라인 속성 목록에 사용할 수 있습니다.*

{:attr-list-def: #EatChangmyeong .custom-class style="text-decoration: underline;"}

```
{:attr-list-def: #EatChangmyeong .custom-class style="text-decoration: underline;"}
```

## 인라인 속성 목록 (kramdown 확장)

*위에서 정의한 속성 목록을 참조하거나 직접 id, 클래스, HTML 속성을 작성해 바로 앞의 HTML 요소에 임의의 속성을 추가할 수 있습니다.*

<div class="split">
<div class="split-column">
* {:attr-list-def}`<li>`에 `attr-list-def`가 적용된 상태
* {:attr-list-def #Eatch}직접 작성한 속성이 우선권을 갖습니다.
</div>
<div class="split-column">
```
* {:attr-list-def}`<li>`에 `attr-list-def`가 적용된 상태
* {:attr-list-def #Eatch}직접 작성한 속성이 우선권을 갖습니다.
```
</div>
</div>

## 기타 kramdown 확장 문법

*위에서 설명한 kramdown 속성 목록 정의와 비슷한 문법으로 일부 확장 문법을 사용할 수 있습니다.*

<div class="split">
<div class="split-column">
* {::comment}이 부분은 주석이라서 보이지 않습니다.{:/} 이 부분은 보입니다.
* {::nomarkdown}**마크다운 문법**을 적용하지 *않습니다*.{:/}
</div>
<div class="split-column">
```
* {::comment}이 부분은 주석이라서 보이지 않습니다.{:/} 이 부분은 보입니다.
* {::nomarkdown}**마크다운 문법**을 적용하지 *않습니다*.{:/}
```
</div>
</div>

* `{::options key="value"}`로 kramdown 파서 설정을 글 단위로 변경할 수 있습니다. 안 써봐서 실제로 되는지는 모르겠습니다.

# 커스텀 확장 문법

## 밑줄

*기울임꼴 문법에 아래의 커스텀 클래스를 추가해 밑줄을 표시할 수 있습니다. 가급적이면 이 문법 대신 **HTML 태그를 직접 사용**하거나 기울임꼴만 사용하는 것을 권장합니다.*

<div class="split">
<div class="split-column">
* *밑줄 (기울임꼴 문법 해제)*{:.u}
* *밑줄 (기울임꼴 문법 유지)*{:.ui}
</div>
<div class="split-column">
```
* *밑줄 (기울임꼴 문법 해제)*{:.u}
* *밑줄 (기울임꼴 문법 유지)*{:.ui}
```
</div>
</div>

*기울임꼴 문법에 인라인 속성 문법을 추가하는 대신 HTML 태그에 위 클래스를 추가해도 됩니다.*

<div class="split">
<div class="split-column">
* <span class="u">밑줄만 적용</span>
* <span class="ui">밑줄 + 기울임꼴</span>
</div>
<div class="split-column">
```
* <span class="u">밑줄만 적용</span>
* <span class="ui">밑줄 + 기울임꼴</span>
```
</div>
</div>

## 좌우 분리

<div class="split">
<div class="split-column">
<div class="split">
<div class="split-column">
왼쪽 내용과 오른쪽 내용이 별개의 단에 표시됩니다.
</div>
<div class="split-column">
* 다람쥐 헌 쳇바퀴에 타고파
</div>
</div>
</div>
<div class="split-column">
```
<div class="split">
<div class="split-column">
왼쪽 내용과 오른쪽 내용이 별개의 단에 표시됩니다.
</div>
<div class="split-column">
* 다람쥐 헌 쳇바퀴에 타고파
</div>
</div>
```
</div>
</div>

[^fn_paragraph]: 어떤 콘텐츠의 바로 아래에 빈 줄이 있으면 그 아래의 콘텐츠와 분리되어 "한 문단"이 됩니다.