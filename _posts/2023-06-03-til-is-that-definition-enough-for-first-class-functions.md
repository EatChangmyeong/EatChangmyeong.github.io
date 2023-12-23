---
layout: post
title: "TIL: 일급 함수, 그 정의로 충분할까?"
edited_at: 2023-12-23
tags:
- 언어
- 함수형
- TIL
comments: true 
---

어느 순간 문득 깨달았는데, 어떤 면에서는 **C도 일급 함수를 지원하는 게 아닌가**라는 생각이 들었습니다. 정말 뚱딴지같은 소리긴 하지만 일단 들어보세요.

# 일급 객체의 조건

보통 [일급 객체](https://ko.wikipedia.org/wiki/일급_객체)라고 하면 "다른 객체들에 일반적으로 적용 가능한 모든 연산을 지원하는 객체"를 의미하고, 구체적으로는 이 세 가지 조건을 드는 경우가 많습니다.

1. 변수에 대입할 수 있을 것.
1. 함수에 인자로 넘길 수 있을 것.
1. 함수의 반환값으로 쓰일 수 있을 것.

예를 들어 반론의 여지 없이 함수가 일급 객체인 JavaScript에서는 이렇게 할 수 있습니다.

```javascript
// 변수에 대입할 수 있을 것
let cmp_asc = (l, r) => l - r;
let cmp_desc = (l, r) => r - l;

// 함수에 인자로 넘길 수 있을 것
[1, 3, 2].sort(cmp_asc);

// 함수의 반환값으로 쓰일 수 있을 것
function cmp(desc) {
	return desc
		? cmp_desc
		: cmp_asc;
}
```

그런데 한편 C에서도 이렇게 할 수 있습니다.

```c
#include <stdlib.h>

int cmp_asc(const void *l, const void *r) {
	return *(const int *)l - *(const int *)r;
}
int cmp_desc(const void *l, const void *r) {
	return *(const int *)r - *(const int *)l;
}

int main(void) {
	// 변수에 대입할 수 있을 것
	int (*fn)(const void *, const void *) = cmp_asc;
	
	int arr[3] = { 1, 3, 2 };
	// 함수에 인자로 넘길 수 있을 것
	qsort(arr, 3, sizeof(int), fn);
}

// 함수의 반환값으로 쓰일 수 있을 것
int (*cmp(int desc))(const void *, const void *) {
	return desc
		? cmp_desc
		: cmp_asc;
}
```

(놀랍게도 C에서도 함수 포인터를 반환할 수 있습니다. 저번에 올렸던 [이 글](/2020/12/30/all-about-c-type-system.html)도 읽어보시면 좋습니다.)

"함수가 아니라 함수 포인터를 반환하는 거 아니냐"는 반응을 할 수도 있을 것 같은데, 애초에 C의 언어 명세상 [모든 함수는 함수 포인터의 형태로 호출됩니다](/2020/12/30/all-about-c-type-system.html#배열과-함수는-포인터로-바뀐다). 그리고 그 문제가 아니더라도 *특정한 동작을 전달하고 실행하는 데 그 형태가 함수냐 함수 포인터냐는 중요하지 않다*는 것이 제 사견입니다.

이렇게 (포인터의 형태로) 일급 객체의 조건을 모두 충족하는데도 C의 함수가 일급 객체라고 생각하는 사람은 아무도 없습니다. 무엇이 잘못된 것일까요?

# 다른 시각으로 보는 일급 함수

이쯤에서 위에서 인용한 위키백과 글을 더 꼼꼼히 읽어 봅시다. [함수 문단](https://ko.wikipedia.org/wiki/일급_객체#함수)을 보면 이런 내용을 찾을 수 있습니다.

> 대다수의 언어에서 함수를 다른 함수에 매개 변수로 전달하거나 리턴 값으로 받을 수 있는데, 이러한 속성이 일급 객체의 조건으로 충분한 지에 대해서는 논쟁의 여지가 있다.
>
> 일부 저자들의 경우 함수가 '일급 객체'가 되기 위한 조건으로 런타임에 함수 생성 가능 여부를 드는데, 이 조건에 의하면 C와 같은 언어에서의 함수는 일급 객체가 아니다. C의 함수와 같은 객체들은 경우에 따라서 **이급 객체**로 불리기도 하는데, 비록 일급 객체의 속성을 모두 갖추지는 못했다 하더라도 그에 상응하는 방식으로 다뤄질 수 있기 때문이다.

이외에도 영문 위키백과의 [First-class function](https://en.wikipedia.org/wiki/First-class_function) 항목에는 이러한 시각도 있습니다.

> 어떤 프로그래밍 언어론자들은 [일급 함수의 조건으로] 익명 함수(함수 리터럴)를 추가로 제시하기도 한다.
>
> Some programming language theorists require support for anonymous functions (function literals) as well.

이 글을 처음 썼을 때는 익명 함수보다는 클로저를 지원해야 한다고 생각한다는 단순 의견만 적었었는데, 그동안 생각이 더 정리되어서 부연 설명을 더 적기로 했습니다. 위의 인용문에서 "런타임에 함수 생성"에 집중해 봅시다.

```c
#include <stdio.h>

int main(void) {
	double
		a = 0.22561007516091158,
		b = 0.5653166761141877,
		c = a + b;
	printf("%f", c);
}
```

`0.22561007516091158`과 `0.5653166761141877`은 방금 생성한 무작위의 실수입니다. (최적화를 생각하지 않는다면) C 표준 라이브러리에도 위의 코드에도 `c = 0.7909267512750993`이라는 값이 있을 리가 없는데, 컴파일된 C 프로그램은 이 값을 문제 없이 잘 처리합니다. **런타임에 새로운 `double` 값이 생성**된 것입니다.

반면 처음 언급했던 "다른 객체들에 일반적으로 적용 가능한 모든 연산을 지원", 즉 "다른 객체를 다루는 것처럼 다룰 수 있다"는 측면에서 보면, 함수는 소스 코드에 정의한 것 이외에 런타임에 다른 것을 추가로 만들거나 포인터로 참조할 수 없습니다. C의 함수가 일급 객체가 아니라고 하는 것은 아마 이것을 의미하는 것 같습니다.

제가 알고 있는 "런타임에 함수 생성" 방법은 크게 두 가지로 나뉩니다.

## 완전히 동적으로 생성

많은 인터프리터 언어에는 `eval`이나 `exec`이라는 함수가 있어서 문자열을 코드로 해석하고 실행할 수 있고, 이를 ~~악용~~ 활용해서 동적으로 함수를 생성할 수 있습니다.

```python
def exec_test(a, b):
	exec("print(a + b)")

exec_test(1, 2) # 3
```

JavaScript에서는 추가로 `Function` 생성자를 이용해 문자열을 바로 실행하는 대신 *함수로* 만들 수 있습니다.

```javascript
// function(a, b) { console.log(a + b); }와 같습니다.
const dynamic_function = new Function('a', 'b', 'console.log(a + b);');

dynamic_function(1, 2) // 3
```

이 분야의 원조인[^fn-lisp-eval] Lisp에서는 *아무 자료구조를* `eval`할 수 있습니다. 코드와 데이터를 똑같은 자료구조로 표현하기 때문에(이 성질을 [homoiconicity](https://en.wikipedia.org/wiki/Homoiconicity)라고 합니다) 가능한 묘기입니다. 아래는 [영문 위키백과](https://en.wikipedia.org/wiki/Eval#Lisp)에서 가져온 예제입니다.

```lisp
; `form1`에 `'(+ 1 2 3)`을 대입합니다.
; `'`은 "인용"(quotation) 표시로, 인용된 코드는 실행되는 대신 데이터로 취급합니다.
; * 그냥 `(+ 1 2 3)`이라고 작성하면 1, 2, 3을 더해서 6으로 평가되는 코드가 됩니다.
; * 아래와 같이 `'(+ 1 2 3)`이라고 작성하면 차례대로 심볼 `+`, 수 `1`, `2`, `3`을 원소로 가지는 링크드 리스트가 됩니다.
(setq form1 '(+ 1 2 3))

; `form1`을 "실행"해서 6을 반환합니다.
(eval form1) ; 6
```

그런데 사실 이 방식은 소 잡는 칼이라는 느낌이 듭니다. 그냥 함수 몇 개만 새로 만들고 싶었을 뿐인데 (Lisp과 같은 경우를 제외하면) 문자열을 해석해서 실행하는 엔진이 딸려오니 엄청나게 무겁고, 또한 컴파일 언어에서는 지원하기 어려우며 보안 문제가 있다는 단점도 있습니다.

그 대신 대다수의 언어에서 지원하는 방식은 이렇습니다.

## 데이터를 동반하는 함수

"일급 함수"를 지원한다고 여겨지는 언어와 아닌 언어의 차이점을 생각해 보면, 함수 안에서 참조할 수 있는 변수의 범위가 다릅니다.

```c
static int global = 1;

// C에서는 함수 안에서 함수를 정의할 수 없기 때문에 JavaScript 코드와 달리 바깥에 작성했습니다.
int fn(void) {
	int local = 3;
	
	printf("%d\n", global); // 1
	printf("%d\n", outer_local); // use of undeclared identifer 'outer_local'
	printf("%d\n", local); // 3
}

int main(void) {
	int outer_local = 2;
	fn();
}
```

```javascript
const global = 1;

function main() {
	const outer_local = 2;
	
	function fn() {
		const local = 3;
		
		console.log(global); // 1
		console.log(outer_local); // 2
		console.log(local); // 3
	}
	
	fn();
}
```

언어마다 자세한 사항은 다르겠지만, 전역 변수와 현재 함수 안에 있는 지역 변수(매개변수 포함)는 이급 함수에서도 참조할 수 있지만 *바깥 범위의 지역 변수*는 일급 함수에서만 참조할 수 있습니다. 즉, 이급 함수로 일급 함수를 모사하려면 바깥 범위의 지역 변수를 전역 변수로든 매개변수로든 받을 수 있어야 합니다.

이를 구현하는 방법이 몇 가지가 있는데...

* **[클로저](https://ko.wikipedia.org/wiki/클로저_(컴퓨터_프로그래밍))**: JavaScript 등 인터프리터/스크립트 언어에서 주로 사용하는 방법으로, 함수 자체에 바깥 함수의 범위를 묶어놓아서 이를 통해 참조할 수 있도록 합니다.
* **[부분 적용](https://en.wikipedia.org/wiki/Partial_application)**: 구현 기법이라기보다는 패턴에 가까워 보이는데, 다변수 함수의 매개변수 중 몇 개를 미리 채워놓고 채우지 않은 것만을 매개변수로 하는 새로운 함수를 만드는 기법입니다.
	* 다만 Haskell 등 커링을 지원하는 일부 함수형 언어에서는 실제로 부분 적용된 함수를 데이터로서 주고받는 방식으로 구현된 것 같습니다.
* **[함수 객체](https://en.wikipedia.org/wiki/Function_object)**: C++ 등 컴파일 언어에서 주로 사용하는 방법으로, 클로저 대신 외부 상태를 복사해서 담는 일회용 구조체/클래스를 만들고 그 구조체를 함수처럼 호출할 수 있도록 합니다.
* **`this` 값 묶어놓기**: 자유도는 조금 떨어지지만, 함수가 `this`를 지원하는 객체지향 언어에서는 함수에 `this` 값을 묶어서 들고 다니기도 합니다. C++의 (`.*`과 `->*` 연산자로 만드는) 멤버 함수 포인터와 JavaScript의 ([`Function.prototype.bind`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)로 만드는) 바인딩한 함수가 여기에 속합니다.
* 이외에 제가 모르는 방식이 또 있다면 제보 부탁드립니다.

구현 방식은 서로 다르지만, 모두 *함수에 외부 데이터를 묶어놓는다*는 공통점을 띠고 있습니다. 위의 방식과 비교해서 꽤 제한적이지만 이 정도만 지원해도 *웬만한* 함수형 프로그래밍은 다 할 수 있습니다[^fn-sk-combinator].

결론을 말씀드리자면, 위에 나열한 일급 함수 구현 방식 중 **처음 세 개 중 하나만 구현하면 일급 함수라고 부를 수 있다**는 것이 제 의견입니다.

# 여담: `this` 값 묶어놓기에 대하여

마지막 문단을 읽고 나서 "그럼 `this` 값 묶어놓기는 불충분한가요?"라고 생각하고 계신다면, [GameMaker](https://gamemaker.io)로 예시를 들어 보겠습니다.

게임메이커 언어는 스튜디오 2.3 시점부터 익명 함수를 지원하기 시작했고, 여기에 [적당히 흑마술을 부려서 클로저와 비슷한 것을 구현해본 적이 있었습니다](/2020/04/24/gms-tips.html#오묘한-함수형-프로그래밍의-세계). 이때 작성했던 코드는 다음과 같습니다.

{:.gml}
```javascript
function plus_function(_x) {
	return method({
		_x: _x
	}, function(_y) {
		return self._x + _y;
	});
}

var plus_three = plus_function(3);
show_message([ plus_three(5), plus_three(123) ]); // [ 8, 126 ]
```

여기서 `self`와 [`method(struct, fn)`](https://manual.gamemaker.io/monthly/en/#t=GameMaker_Language/GML_Reference/Variable_Functions/method.htm)은 각각 JavaScript의 `this`와 `fn.bind(struct)`와 비슷한 동작을 합니다. 즉, **`this` 값 묶어놓기**에 해당하는 구현입니다. 당시에는 게임메이커 언어가 클로저를 지원하지 않았는데, 2023.11 업데이트가 올라온 지금도 그런지는 잘 모르겠습니다. 현재는 군 복무로 인해 GameMaker를 쓸 수 없는 관계로 제가 기억하는 동작을 기준으로 작성하며, 다음 휴가 동안 다시 확인해 보겠습니다.

`method` 호출에서 볼 수 있듯이, 이 방식은 *외부 변수를 수동으로 가져와야 합니다*. JavaScript에서는 변수 범위 전체를 클로저로 잡아주기 때문에 무슨 변수를 사용할지 일일이 작성할 필요가 없습니다.

```javascript
function plus_function(_x) {
	return function(_y) {
		return _x + _y;
	};
}
```

함수 객체 방식에서도 일회용 구조체 타입은 언어가 알아서 만들어주며, 외부 변수도 일일이 작성할 필요가 없거나 작성하더라도 보통 더 깔끔한 문법을 제공해줍니다.

추가로 GameMaker에 원래 있는 `self`를 원래의 의미대로 사용할 수 없다는 단점도 있습니다. 클로저와 `self`를 둘 다 쓰고 싶다면 아래와 같이 우회해야 합니다. 못생겼네요.

{:.gml}
```javascript
function closure_and_self(_x) {
	var _self = self;
	return method({
		_x: _x,
		_self: _self
	}, function() {
		return self._x + self._self.y;
	});
}
```

[^fn-lisp-eval]: John McCarthy의 History of Lisp에 따르면 [프로그래밍 언어 인터프리터가 발명된 계기가 Lisp의 `eval`이었다고 합니다](http://www-formal.stanford.edu/jmc/history/lisp/node3.html).
[^fn-sk-combinator]: 사실 `K(x)(y) = x`, `S(x)(y)(z) = x(z)(y(z))`의 두 함수와 부분 적용만 지원해도 계산가능한 모든 함수를 표현할 수 있다는 것이 [알려져 있습니다](https://en.wikipedia.org/wiki/SKI_combinator_calculus).
