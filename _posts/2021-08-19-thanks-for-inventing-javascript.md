---
layout: post
title: "Thanks for inventing JavaScript"
image: "/assets/post-images/thanks-for-inventing-javascript.png"
edited_at: 2022-04-05
tags:
- JavaScript
- Language
- Rant
comments: true
---

*2022년 4월 5일 수정: 코드 가독성을 향상했습니다.*

![JavaScript의 특이한 코드 실행 결과 여러 개가 있고 그 밑에 사람의 얼굴과 "Thanks for inventing Javascript"라는 문구를 달아 두었다.](/assets/post-images/thanks-for-inventing-javascript.png)

어린 시절(나이가 1자리 수였을 때로 기억하고 있습니다)에 HTML 학습 사이트에 올라온 자바스크립트 달력 코드를 보고 따라해본 적이 있었습니다(실패했습니다). 또 나이가 더 들고 나서는 유명한 웹게임인 [쿠키클리커](https://orteil.dashnet.org/cookieclicker/)의 한국어 번역 플러그인을 만들다가 던진 기억이 있습니다.

글 시작부터 좀 뜬금없는 얘기를 하긴 했는데, 아무튼 이런저런 이유로 자바스크립트가 마음의 고향인 저에게 이 "Thanks for inventing JavaScript" 짤을 보면 자바스크립트를 억지로 까고 있는 것 같아 신경쓰이는 점이 한두 가지가 아닙니다. 이미 다른 분들이 지적해주셨을 것 같긴 한데 이 블로그에도 "자바스크립트만 그런 게 아니다" 위주로 짧게 몇 마디를 적어보려고 합니다.

참고로 구글 이미지검색을 해본 결과 이 이미지는 2018년 6월 21일에 [레딧의 r/ProgrammerHumor에 처음 올라왔던 것](https://www.reddit.com/r/ProgrammerHumor/comments/8srix1/thanks_brendan_for_giving_us_the_javascript/)으로 보입니다. 이 이전의 검색결과 중 실제로 해당 이미지가 있는 페이지는 찾지 못했습니다.

# `typeof NaN`

`NaN`("수가 아님") 값의 타입이 `"number"`라서 얼핏 보면 헛웃음이 나올 것 같긴 한데, **C/C++와 Python에서도 `NaN`의 타입은 다른 실수와 구분되지 않습니다.** 자바스크립트만의 문제가 아닙니다.

```cpp
#include <iostream>
#include <cmath>
#include <typeinfo>

template<class T> void print_type(T x) {
	std::cout << typeid(x).name() << " " << x << std::endl;
}

int main() {
    double
		number = 12.34,
		not_a_number = 0./0.,
		explicit_nan = NAN;

	/*
		typeid(...).name()은 컴파일러에 따라 다른 값을 반환할 수 있지만,
		같은 컴파일러에서 같은 타입이면 같은 문자열을 반환합니다.
	*/
	print_type(number); // d 12.34
	print_type(not_a_number); // d nan
	print_type(explicit_nan); // d nan
    return 0;
}
```

```python
from math import nan
print(type(1.)) # <class 'float'>
print(type(nan)) # <class 'float'>
```

애초에 `NaN`은 **[IEEE 754](https://ko.wikipedia.org/wiki/IEEE_754) 표준**에서 정의하고 있는 값이기 때문에 부동소숫점 타입이 있는 웬만한 언어에는 전부 들어가 있고 일반적인 실수와 같은 타입입니다. `NaN`만 다른 타입인 게 오히려 이상합니다.

# `9999999999999999`

**이것도 IEEE 754 문제입니다.** 자바스크립트만의 문제가 아닙니다. 당연히 C/C++에서 재현 가능합니다.

```c
#include <stdio.h>

int main(void) {
	double gazillion = 9999999999999999.;
    printf("%f\n", gazillion); // 10000000000000000.000000
    return 0;
}
```

참고로 진짜로 정수 '9999999999999999'를 정확히 표현하고 싶다면 [BigInt](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/BigInt) `9999999999999999n`을 쓰면 됩니다. 단, BigInt끼리만 연산할 수 있습니다.

자릿수가 맞는지 모르겠네요. 9를 하나 빼먹거나 더 썼다면 제보해 주세요.

# `0.1+0.2==0.3`

이 문제는 이미 [이 블로그에서 언급한 바가 있고](/2020/04/24/gms-tips.html#01--02-neq-03), **[아예 이 문제만 다루는 웹페이지도 있습니다.](https://0.30000000000000004.com/)** 벌써 3번째 얘기하는 거지만 자바스크립트만의 문제가 아닙니다. 이미 예상하셨겠지만 이것도 IEEE 754 문제입니다.

# `Math.max()`

이 함수는 애초에 **인자로 주어진 수 중에** 가장 큰 수를 구하는 함수지, 무턱대고 가장 큰 수를 반환하는 함수가 아닙니다. `-Infinity`가 아니라 `Infinity`일 이유가 전혀 없습니다.

인자를 0개 전달받았을 때 그냥 `throw`를 해도 되긴 하지만, 굳이 `-Infinity`를 반환하겠다면 그 이유를 수학적으로 정당화할 수 있습니다. 덧셈에는 **[항등원](https://ko.wikipedia.org/wiki/%ED%95%AD%EB%93%B1%EC%9B%90)**, 즉 $$a + e = a$$와 $$e + a = a$$를 만족하는 $$e = 0$$이 있고, 모든 덧셈은 암묵적으로 항등원이 붙는 것으로 생각할 수 있습니다.

$$a + b + c = 0 + a + b + c$$

즉, "0개의 수를 더하는 것"은 "덧셈의 항등원에 0개의 수를 더하는 것", 즉 그냥 덧셈의 항등원이 되는 것으로 이해할 수 있습니다.

$$\sum_{x \in \emptyset} x = 0$$

한편 $$\max$$ 연산에도 $$\max(a, e) = a$$와 $$\max(e, a) = a$$를 만족하는 항등원이 있는데, 이 값이 다름아닌 **$$-\infty$$입니다**.[^fn-identity] 즉, 위와 같은 논리로 0개의 수의 최댓값은 $$-\infty$$인 것으로 생각할 수 있습니다. 이는 `Math.min() == Infinity`에도 똑같이 적용됩니다.

참고로 진짜로 JavaScript에서(즉, `double` 타입에서) 표현할 수 있는 가장 큰/작은 (유한한) 수를 구하고 싶다면 다음과 같은 방법이 있습니다.

* `Number.MAX_VALUE` (가장 큰 수, `1.7976931348623157e+308`)
* `Number.MAX_SAFE_INTEGER` (정확히 나타낼 수 있는 가장 큰 정수, `9007199254740991`)
* `Number.MIN_VALUE` (가장 작은 양수, `5e-324`)
* `Number.MIN_SAFE_INTEGER` (정확히 나타낼 수 있는 가장 작은 정수, `-9007199254740991`)

# `[]+[]`

어... 이건 자바스크립트 잘못이 맞습니다. 이외에 `[]+{}`, `{}+[]`, `(!+[]+[]+![]).length`, `9+"1"`, `91-"1"`은 생략하겠습니다. 혹시 `(!+[]+[]+![]).length`에 흥미가 생기신다면 [이 페이지](http://www.jsfuck.com/)도 확인해 보세요.

# `true+true+true===3`, `true-true`

**C++와 Python에서도 똑같은 현상이 발생합니다.** 그런데 불린을 정수로 형변환하는 게 편리할 때가 많지 않나요?

```cpp
#include <iostream>
#include <typeinfo>

template<class T> void print_type(T x) {
	std::cout << typeid(x).name() << " " << x << std::endl;
}

int main() {
	bool foo = true;
	print_type(foo); // b 1
	print_type(foo + foo + foo); // i 3
	print_type(foo - foo); // i 0
    return 0;
}
```

```python
def print_type(x):
	print(f"{type(x)} {x}")

print_type(True) # <class 'bool'> True
print_type(True + True + True) # <class 'int'> 3
print_type(True - True) # <class 'int'> 0
```

# `true==1`, `true===1`, `[]==0`

이것도 자바스크립트 잘못이 맞아서 제가 뭐라고 할 수가 없긴 한데, 대신 최근에 봤던 [이 글](https://algassert.com/visualization/2014/03/27/Better-JS-Equality-Table.html)(영어)을 공유해드릴 수는 있을 것 같습니다.

<blockquote class="twitter-tweet" data-dnt="true"><p lang="ko" dir="ltr">TL;DR: &quot;JS의 == 연산자가 구린 건 맞지만 왼쪽만큼만 구린 걸 오른쪽처럼 만들어서 선동질하지는 마라&quot; <a href="https://t.co/Ma2tqxn10L">pic.twitter.com/Ma2tqxn10L</a></p>&mdash; 잇창명 EatChangmyeong💕 (@EatChangmyeong) <a href="https://twitter.com/EatChangmyeong/status/1426610751238590467?ref_src=twsrc%5Etfw">August 14, 2021</a>
</blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

# 결론

JavaScript의 문제가 아닌 걸 치우고 IEEE 754의 문제만 따로 모아놓으면 이 정도가 됩니다.

![위의 "Thanks for inventing Javascript" 이미지에서 자바스크립트 자체의 문제인 코드만 남겼다.](/assets/post-images/thanks-for-inventing-javascript-fixed.png)

![위의 "Thanks for inventing Javascript" 이미지에서 IEEE 754의 문제인 코드만 남기고 문구를 "Thanks for inventing IEEE 754"로 수정했다.](/assets/post-images/thanks-for-inventing-ieee-754.png)

차라리 자바스크립트를 이렇게 깠으면 저도 트위터에 "자바스크립트넘구데기" 같은 자조적인 트윗을 쓰면서 저 짤을 올렸을 겁니다. 맨 위의 짤은 *자바스크립트 자체의 문제가 아닌 것을 슬쩍 끼워넣어서 문제의 본질을 흐리고 있습니다*. 애초에 그냥 웃자고 만든 밈짤인데 민감하게 반응한 감도 없지는 않지만, 누군가는 이 얘기를 해야 한다고 항상 생각하고 있었습니다. 아무튼 저는 할 말을 전부 했으니 여한이 없습니다. 😝

[^fn-identity]: 엄밀히 말해 $$\max$$의 항등원은 [확장된 실수](https://en.wikipedia.org/wiki/Extended_real_number_line), 즉 $$\pm \infty$$가 추가된 실수 체계에서만 정의되며, 일반적인 실수 집합에서는 $$\max$$의 항등원이 존재하지 않습니다. 추가로 JavaScript의 `number`에는 `NaN`이 정의되어 있는데, $$\max(\mathrm{NaN}, -\infty) = \max(-\infty, \mathrm{NaN}) = \mathrm{NaN}$$이므로 문제가 없습니다.