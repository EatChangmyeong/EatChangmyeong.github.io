---
layout: post
title: "TIL: 일급 함수, 그 정의로 충분할까?"
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

```js
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

> 어떤 프로그래밍 언어론자들은 [일급 함수의 조건으로] 익명 함수(함수 리터럴)을 추가로 제시하기도 한다.
>
> Some programming language theorists require support for anonymous functions (function literals) as well.

이것도 제 사견인데, 저는 익명 함수보다는 [클로저](https://ko.wikipedia.org/wiki/클로저_(컴퓨터_프로그래밍))(JavaScript에서 말하는 그 클로저입니다) 지원 여부가 흔히 생각하는 일급 함수의 조건에 더 부합한다고 생각합니다.

게임메이커로 예를 들어보자면, 게임메이커 언어는 스튜디오 2.3 시점부터 익명 함수를 지원하기 시작했고, 여기에 [적당히 흑마술을 부리면 클로저와 비슷한 것을 구현할 수 있다는 것을 확인했습니다](/2020/04/24/gms-tips.html#오묘한-함수형-프로그래밍의-세계). 이때 작성했던 코드는 다음과 같습니다.

{:.gml}
```js
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

그런데 이렇게 흑마술을 부려야 했던 것은 언어 자체적으로 클로저를 지원하지 *않았기* 때문입니다(지금도 그런지는 잘 모르겠습니다). 클로저 지원이 있었다면 이렇게 군더더기 없는 코드를 짤 수 있었을 것입니다.

{:.gml}
```js
function plus_function(_x) {
	return function(_y) {
		return _x + _y;
	};
}
```

그나마 `self` 덕분에 클로저를 쉽게 흉내낼 수 있었고 그렇지 않았으면 더 무시무시한 흑마술을 부렸을지도 모르겠습니다.

클로저 지원이 없다는 것은 모든 중첩/익명 함수를 함수 밖으로 빼고 기명 함수[^fn-named-function]로 바꾸어도 동작에 별 차이가 없다는 의미이기도 합니다.

{:.gml}
```js
function __anonymous1(_y) {
	return self._x + _y;
}
function plus_function(_x) {
	return method({
		_x: _x
	}, __anonymous1);
}

var plus_three = plus_function(3);
show_message([ plus_three(5), plus_three(123) ]); // [ 8, 126 ]
```

그런데 이런 프로그래밍 방식은 **C에서 항상 하던 그것과 다를 바가 없습니다**. `self`를 별도의 인자로 빼면 더욱더 다를 바가 없어집니다.

```c
#include <stdio.h>

// 보일러플레이트 코드
struct __Self {
	int _x;
};
struct __PlusFunction {
	struct __Self self;
};
int __anonymous1(struct __Self, int);
int __call(struct __PlusFunction f, int x) {
	return __anonymous1(f.self, x);
}

// 여기서부터 실제 코드
int __anonymous1(struct __Self self, int _y) {
	return self._x + _y;
}
struct __PlusFunction plus_function(int x) {
	return (struct __PlusFunction){ { x } };
}

int main(void) {
	struct __PlusFunction plus_three = plus_function(3);
	printf("%d %d", __call(plus_three, 5), __call(plus_three, 123)); // 8 126
}
```

실제로 돌아가게 짜려다 보니 코드가 많이 번잡해지긴 했는데, 제가 하려던 말은 클로저가 없는 익명 함수는 (함수형 패러다임을 구사하는 측면에서) 없는 것과 다를 바가 없다는 뜻이었습니다. 거꾸로 클로저만 있고 익명 함수만 없다면 그냥 기명 중첩 함수를 만들어서 쓰면 됩니다.

```js
function plus_function(x) {
	function inner(y) {
		return x + y;
	}
	return inner;
}
```

# 결론

잡담이 길었네요. 아무튼 이 글의 논지를 정리하자면 **클로저 정도까지는 지원해야 일급 함수라고 할 수 있다. 익명 함수는 없어도 된다**입니다.

여기까지 생각을 정리하는 데 도움을 준 게임메이커 언어와 게임메이커의 개발자분들께 감사를 표합니다.

[^fn-named-function]: 이것 역시 제 사견인데, ["named function"의 번역어로는 사전적 의미가 "이름이 널리 알려져 있음"인 "유명"보다는 "이름을 적음"인 "기명"이 더 적합하다고 생각합니다](https://twitter.com/EatChangmyeong/status/1629379693043671041).
