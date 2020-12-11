---
layout: post
author: EatChangmyeong
actual_title: "C 타입 시스템 제대로 알고 가기"
excerpt: "왜 그렇게나 헷갈리던지"
categories:
- Beta
tags:
- Programming
---

*이유 없이 갑자기 베타로 올려본 글입니다. 주소로만 접근할 수 있고 나중에 완성한 다음에 공개하려고 해요*

C 코딩을 할 때, 다음 중 가장 "올바른" 코딩 스타일은 무엇일까요?

* `int*x;`
* `int* x;`
* `int *x;`
* `int * x;`

물론 정답은 없습니다. 코딩 스타일이 원래 스페이스냐 탭이냐로 싸우는 주제잖아요. 스페이스 3칸 너비의 탭(???)이나 `int*x;`처럼 누가 봐도 오답인 것이 있긴 합니다.

저라면 이 질문에 무조건 `int *x;`라고 답할 것입니다. 물론 근거 없이 `int *x;`라고 우기는 것은 아닙니다. 그동안 C 타입 시스템에 관심이 있어서 [cppreference](https://cppreference.com/) 문서를 이것저것 읽어봤는데, 읽으면 읽을수록 `int* x;`가 아니라 `int *x;`가 맞다는 확신이 들더라고요. 추가로 그동안 될 거라고 생각조차 못 했던 문법도 여러 가지 알게 되었습니다.

네. 이 글은 C 타입 시스템에 대해 정리하는 글입니다. C의 타입 시스템을 여러 부분으로 나누어 하나씩 있는 그대로 설명하고, 주의할 점이 있으면 같이 적습니다. 모든 세부사항을 적지는 않을 예정이기 때문에, 몰랐던 부분에 대해 더 알고 싶다면 구글링을 권장드립니다.

위에서 언급한 `int *x;` 이외에도 C 타입 시스템을 더 잘 이해한다면...

* 단 한 번의 `malloc` 호출로 다차원 배열을 할당받을 수 있습니다.
* `int *(*(*x)(char *))[64];` 같은 헷갈리는 선언을 그나마 쉽게 읽을 수 있습니다.
	* 근데 웬만하면 이런 식으로 선언하지 말아주세요.
* `const int *x`와 `int const *x`와 `int * const x`의 차이를 이해할 수 있습니다.
* `typedef`가 조금 더 직관적으로 다가올 수도 있습니다.

오호! 1번 빼고 전부 헷갈리는 것들뿐이군요. 이 글을 읽으면서 C 타입 시스템은 왜 그렇게 복잡한지 조금이라도 이해할 수 있게 된다면 좋겠습니다.

이 글은 C가 어느 정도 익숙한 분들께 적합합니다. 정식 용어가 뭔지 몰라서 제가 만들어낸 단어들이 섞여있을 수 있습니다. 혹시 올바른 단어를 알고 계신다면(틀린 내용 제보도 받습니다) dlaud5379 at naver.com이나, 댓글창이 생겼다면 댓글로 제보해 주세요.

# 시작하기 전에: C 표준 확인하고 가세요

C 표준은 그동안 여러 번의 개정을 거쳤습니다.

C 표준이 있기 전에는 [*The C Programming Language*](https://en.wikipedia.org/wiki/The_C_Programming_Language)(`hello, world`가 처음 나온 그 책이 맞습니다)가 사실상의 표준 역할을 했습니다. 이 시절의 C "표준"을 책의 저자 이름을 따서 K&R C라고 합니다. 이후 1989년에 최초로 C89라는 표준이 생겼고, 이후 C95, C99, C11, C17까지 4번의 개정을 거쳤습니다. C17은 기능 추가 없이 결함만 수정했습니다.

이런 내용을 알아야 하는 이유는... **개정판에 따라 쓸 수 있는 문법과 없는 문법이 나뉘기 때문입니다**. 예를 들어서 C99 이전까지는 `for`문 안에 선언을 할 수 없었습니다.

```c
for(int i = 0; i < 8; i++) // 'for' loop initial declarations are only allowed in C99 or C11 mode
	printf("%d\n", i);
```

이 글에서는 필요할 때마다 표준 개정판 표기를 넣을 예정입니다. 예를 들어 *(C11~)*은 C11에 추가된 기능이라는 의미입니다. 표준 문제로 컴파일이 안 된다면 컴파일러에 다음과 같이 플래그를 넣어주세요.

* C89: `-ansi`/`-std=c90`
* C95: `-std=iso9899:199409`
* C99: `-std=c99`
* C11: `-std=c11`[^fn-c11-behavior]
* C17: `-std=c17`
* C2x: `-std=c2x` (C의 다음 표준 개정판을 미리 써볼 수 있습니다.)

표준 얘기 하니까 생각난 건데, "for 선언 문법을 최신 C 표준에서는 지원하는데 Dev-C++에서는 지원하지 않는다"는 말을 들었던 적이 있었습니다. [**Dev-C++가 한참 옛날 버전이라서 그렇습니다. 빨리 업데이트하세요.**](https://twitter.com/EatChangmyeong/status/1336705001188540418)[^fn-devcpp]

# 기본 타입

일단 기본적인 것부터 시작하겠습니다. C에 정의된 (라이브러리 지원이나 매크로를 제외하고) 기본 타입에는 다음과 같은 것들이 있습니다. 사람에 따라 대분류를 다르게 할 수도 있긴 한데 여기서는 키워드끼리 조합할 때 가장 간단하게 되도록 묶었습니다.

* `void`
* 불린: `_Bool` *(C99~)*
	* `#include <stdbool.h>`를 하면 `_Bool`을 `bool`로 쓸 수 있습니다.
* 문자: `char`, `signed char`, `unsigned char`
* 정수: 아래의 키워드 3종류에서 하나씩을 조합해서 쓸 수 있습니다. 적어도 하나는 들어가야 합니다.
	* 부호: `signed`(기본값) 혹은 `unsigned`
	* 크기: `short`, *`(없음)`* (기본값), `long`, `long long` *(C99~)*
	* `int` (생략 가능)
* 부동소숫점: 아래의 키워드 2종류에서 하나씩을 조합해서 쓸 수 있습니다.
	* 크기: `float`, `double`, `long double`
	* 복소수 여부: *`(없음)`* (실수), `_Imaginary` (허수) *(C99~)*, `_Complex` (복소수) *(C99~)*
		* `#include <complex.h>`를 하면 `_Imaginary`를 `imaginary`로, `_Complex`를 `complex`로 쓸 수 있습니다.

아래에서 설명하겠지만, 위 타입들을 포인터, 배열, 함수, 구조체 등의 방법으로 다양하게 조합해서 쓸 수 있습니다.

* `char`와 `signed char`와 `unsigned char`는 의외로 모두 다른 타입입니다. 정확히는, `char`는 `signed char`나 `unsigned char` 중 하나가 될 수 있지만 컴파일러가 어느 한쪽을 선택할 수 있도록 합니다(implementation-defined).
* 여러 단어 타입의 경우 단어의 순서를 자유롭게 바꿀 수 있습니다. 예를 들어 `signed char`와 `char signed`가 같은 뜻이며, `int long signed long`(!)은 `long long`과 같습니다. 웬만하면 하지 말아주세요.
* 정수 타입의 크기는 구현체마다 다릅니다. 정확히는, [C 표준에서 타입마다 최소 크기 제한과 크기 관계 제한만 명시하고 있으며 나머지는 자유롭게 정할 수 있습니다](https://en.cppreference.com/w/c/language/arithmetic_types#Integer_types).
	* `short`와 `int`는 16비트 이상
	* `long`은 32비트 이상
	* `long long`은 64비트 이상
	* `1 == sizeof(char) <= sizeof(short) <= sizeof(int) <= sizeof(long) <= sizeof(long long)`
		* 의외로 C 표준에서는 1바이트가 8비트라는 것도 명시하고 있지 않습니다.

# 선언문

사실 C의 타입 시스템은 선언문과 떼려야 뗄 수 없는 관계입니다. C 프로그래밍을 하면서 타입을 적어넣는 곳이라고 하면 십중팔구 선언문이니 그럴 수밖에 없죠. 그런 의미로 무언가 1개를 선언하고 초기화는 하지 않을 때의 기본적인 선언문 구조는 다음과 같습니다.

```c
BaseType declarator;
```

여기서 `declarator`는 `*`, `[]` 등을 포함합니다. 즉, `int *x;`라고 썼다면 `BaseType`은 `int`, `declarator`는 `*x`입니다. 이제 `int *x;`가 맞는 이유가 확실해졌습니다.

잠시만요, 그래도 너무 성급한 거 아닌가요? `*`가 왜 `declarator`로 들어가는데요? 당연히 이것도 근거가 없는 게 아닙니다. 다음 코드를 생각해 봅시다.

```c
int* x, y;
```

누구나 한 번쯤 "이렇게 쓰면 `x`랑 `y` 모두 포인터겠지??"라고 생각하다가 `x`만 포인터인 걸 깨닫고 놀랐던 경험이 있을 겁니다. 이런 의외의 동작은 언어 단계에서

* `int` (`BaseType`)
* `*x` (`declarator`)
* `y` (이것도 `declarator`)

로 묶은 결과인데, 이 동작을 납득한다면 `*`가 `declarator`로 들어가는 것에는 더 의문이 없을 것 같습니다. 하지만 `declarator`에는 더 깊은 의미가 있는데...

## `declarator`는 `BaseType`을 얻기 위해 거치는 연산을 나타낸다

아무 IDE(정 어렵다면 [ideone](https://www.ideone.com/)이나 [repl.it](https://repl.it/languages/c))를 붙잡고 따라해 보세요. `printf` 같은 함수에 넣으면 컴파일러가 타입 체킹을 해주니 확인하는 건 어렵지 않을 겁니다.

* `int x;`에서 `x`는 `int`입니다.
	* ```c
// 여기에 예제 코드가 들어갑니다. int x;는 자명하니 생략합니다.
```
* `int *x;`에서 `*x`는 `int`입니다.
	* ```c
int w = 5, *x = &w;
```
* `int x[64];`에서 `x[18]`은 `int`입니다.
	* ```c
int x[64]; x[18] = 123;
```
* `int *x[123];`에서 `*x[0]`은 `int`입니다.
	* ```c
int w = 5, *x[123]; x[0] = &w;
```
* `int (*x)[8];`에서 `(*x)[2]`는 `int`입니다.
	* ```c
int w[8] = {1, 2, 3, 4}, (*x)[8] = &w;
```
* `int (*(*x[3])[4])[5]`에서 `(*(*x[0])[0])[0]`은 `int`입니다.
	* ```c
int a[5] = {9}, (*b)[5] = &a, (*c[4])[5] = {b}, (*(*d)[4])[5] = &c, (*(*x[3])[4])[5] = {d};
```

과연 우연일까요? 딱히 그래보이지는 않네요. 사전 지식 없이 C 타입 시스템을 처음 접하면 헷갈리게 보이는 이유가 바로 이것이었습니다. 이 내용은 [cppreference.com에서도 확인할 수 있습니다.](https://en.cppreference.com/w/c/language/declarations#Declarators)

이 얘기는 나중에 더 하도록 하겠습니다.

# 파생 타입

특정 연산을 거치면 다른 타입이 되는 변수를 선언할 수 있으며, 크게 세(+1) 가지가 있습니다.

## 포인터

```c
BaseType *x;
```

`BaseType` 타입의 값을 가리키는 주소를 저장합니다. `*x` 연산을 거치면 `BaseType`이 됩니다.

## 배열

```c
BaseType x[n];
```

`BaseType` 타입의 값 `n`개를 메모리의 연속적인 위치에 저장합니다. `x[i]` 연산을 거치면 `BaseType`이 됩니다.

* `n`이 양수가 아닐 경우 컴파일 오류 혹은 정의되지 않은 동작(VLA일 경우)이 됩니다.
* `n`을 생략하면 불완전한 타입이 됩니다. 이 얘기도 나중에 하겠습니다.

### 가변 크기 배열 *(C99~)*

`n`이 컴파일 타임 상수가 아닐 경우 이를 "가변 크기 배열"(variable-length array, VLA)이라고 하며, VLA의 타입 혹은 여기서 파생되는 타입을 variably-modified type이라고 합니다. 일반 배열과 달리 컴파일 타임에는 크기가 결정되지 않고, 선언 부분까지 실행될 때에서야 완전히 결정됩니다.

```c
int x = 5;
int y[x]; // VLA with size x
```

## 함수

```c
BaseType x(args...);
```

일급 객체로 지원되지만 않을 뿐이지, 의외로 함수도 타입으로 볼 수 있습니다. 정해진 타입의 인자를 받아 값을 계산합니다. `x(args...)` 연산을 거치면 `BaseType`이 됩니다.

## 함수 포인터

```c
BaseType (*x)(args...);
```

이건 그냥 함수를 가리키는 포인터이긴 하지만 함수와 함수 포인터는 성질이 매우 다르기 때문에 별도 항목으로 뺐습니다. 특정한 함수의 주소를 저장하며, 가리키고 있는 함수를 호출할 수도 있습니다. `(*x)(args...)` 연산을 거치면 `BaseType`이 됩니다.

## 파생 타입 조합하기

위에서 확인했듯이 파생 타입도 임의의 순서로 조합할 수 있습니다. 예를 들어...

```c
BaseType *x[10];
```

라고 적었을 경우 `*x[1]`을 하면 `BaseType`이 됩니다. 즉, `x`는 `BaseType`의 포인터의 배열입니다. 이렇게 적으면 어떤 순서로 읽어야 되는지 정말 헷갈리는데(`*`이 먼저? `[]`이 먼저?), 웬만한 상황에서 통하는 간단한 규칙이 있습니다.

> 후위 연산자가 전위 연산자보다 우선순위가 높다.

웬만한 언어들의 연산자 우선순위 표에서 이러한 경향성을 찾아볼 수 있었습니다(예외도 있습니다). 잠깐 삼천포로 빠지자면, 예를 들어 [C의 연산자 우선순위](https://en.cppreference.com/w/c/language/operator_precedence) 중 단항 연산자 부분은 이렇습니다.

1. (**후위 연산자**)
	* 후위 증감 `++`/`--`
	* 함수 호출 `()`
	* 배열 참조 `[]`
	* 구조체/공용체 멤버 참조 `.`
	* 포인터를 통한 멤버 참조 `->`
2. (**전위 연산자**)
	* 전위 증감 `++`/`--`
	* 단항 부호 `+`/`-`
	* 논리 NOT `!`
	* 비트 NOT `~`
	* 타입 변환 `(Type)`
	* 역참조 `*`
	* 주소 `&`
	* `sizeof`, `_Alignof`

또 [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence#Table)에서는 이렇습니다.

1. (**후위 연산자**)
	* 멤버 접근 `.`
	* 계산된 멤버 접근 `[]`
	* 함수 호출 `()`
	* 조건부 체이닝 `?.`
	* 인자 목록 있는 `new ...()` (딱히 후위 연산자는 아닌 것 같긴 합니다)
2. 인자 목록 없는 `new ...` (예외로 취급해야 될 것 같네요)
3. (**후위 연산자**) 후위 증감 `++`/`--`
4. (**전위 연산자**)
	* 논리 NOT `!`
	* 비트 NOT `~`
	* 단항 부호 `+`/`-`
	* 전위 증감 `++`/`--`
	* `typeof`, `void`, `delete`, `await`

정확한 이유는 모르겠지만, 일단 저는 `-f()`을 `(-f)()`으로 해석하면 곤란하다는 논리로 받아들이고 있습니다.

다시 타입 시스템 얘기로 돌아오자면, C의 타입 파생에는 크게 3가지가 있었고 하나는 전위, 나머지는 후위입니다.

* 포인터 `*x` (전위)
* 배열 `x[]` (후위)
* 함수 `x()` (후위)

괄호가 없으면 후위가 먼저고 전위가 나중이기 때문에, **포인터 연산 직후에 배열/함수 연산을 해야 한다면 괄호가 필요**하게 됩니다. 예를 들어 위에서 언급한 `BaseType`의 포인터의 배열 `BaseType *x[10];`과 달리 `BaseType (*x)[10];`은 `BaseType`의 배열의 포인터입니다.

같은 논리로 왜 함수 포인터를 선언하려면 괄호가 하나 더 필요한지도 설명할 수 있습니다. `BaseType (*x)()`은 `BaseType`을 반환하는 함수의 포인터인데, 명백하게 포인터 연산이 먼저고 함수 호출이 나중이기 때문에 연산자 우선순위에 따라 괄호가 필요합니다.

그런데 이런 복잡한 타입은 한눈에 알아보기가 어렵습니다. `BaseType`의 포인터의 배열이라고 하면 너무 길고, 위에서 한 선언 그대로 `BaseType *x[10];`이라고 하기에는 읽기가 어렵습니다. 그러니 제가 생각하는 C 타입 읽는 방법을 잠깐 소개하고 넘어갈까 합니다. 다른 글에서 언급하는 "소용돌이 방향으로 읽기" 방법과 비슷하지만 조금 더 엄밀한 방법입니다.

### C 타입 쉽게 읽는 법

`int (*x[8][64])(char *)`를 예로 들어보겠습니다. 아래의 단계들을 하나씩 밟아나가며 타입 표를 작성합니다.

1. `BaseType`을 가장 *왼쪽에* 적는다.
	* | **`int`** |
1. 식별자(정의되는 변수, 함수, 타입 등의 이름)를 찾은 뒤 거기서부터 파생 타입을 읽기 시작한다.
	* 여기서는 `x`입니다.
1. 오른쪽으로 훑으면서 파생 타입이 보이면 표의 *오른쪽부터* 적어 내려간다. 닫는 괄호가 보이거나 선언이 끝나면 멈춘다.
	* | **`int`** | `[64]` | `[8]` |
1. 왼쪽으로 훑으면서 똑같은 작업을 한다. 여는 괄호가 보이거나 선언이 끝나면 멈춘다.
	* | **`int`** | `*` | `[64]` | `[8]` |
1. 지금까지 읽은 선언이 괄호로 감싸져 있을 경우 3번으로 돌아간 뒤 여닫는 괄호부터 읽는다.
1. 더 이상 읽을 것이 없으면 멈춘다.

이 과정을 한 번 더 반복하면서 표의 남은 부분을 마저 채우면 다음과 같습니다.

| **`int`** | `(char *)` | `*` | `[64]` | `[8]` |

이제 `x`의 타입은 "`int`의 `(char *)`의 `*`의 `[64]`의 `[8]`", 자연어로 적으면 "`int`를 반환하는, `char *`를 받는 함수의 포인터 64×8개짜리 배열"(으악!)이라고 할 수 있고, 표의 오른쪽부터 차례대로 연산하면(즉, `[]` 다음에 `[]` 다음에 `*` 다음에 `()`의 순서대로 벗겨내면) `BaseType`인 `int`를 얻을 수 있습니다.

시간이 남는다면 다른 타입에도 연습해보는 게 어떨까요? 아래의 타입에 대해 타입 읽기 표를 만들어 봅시다. 답은 각주에 있습니다.

1. `float **x[4][8];`[^fn-answer-1]
2. `int *(*foo)(int []);`[^fn-answer-2]
3. `char **(*(*z)[123])[456];`[^fn-answer-3]
4. `int *(*(*x)(char *))[64];` (이 글의 맨 위에서 얘기했던 그 선언문입니다.)[^fn-answer-4]

### 함수와 매개변수

사실 C의 함수 선언도 위에서 설명한 타입 시스템으로 나타낼 수 있습니다.

```c
char *foo();
```

문자열을 반환하는 전형적인 함수입니다. 이것도 선언이라고 치고 타입 읽기 표를 만들면 다음과 같습니다.

| **`char`** | `*` | `()` |

"`char`의 포인터(aka 문자열)를 반환하는 함수"입니다. 또 `declarator`의 모양대로 `*foo()`를 하면 `char`가 됩니다. 위에서 작성했던 내용과 완전히 일치하네요!

아니면, 배열의 포인터를 반환하는 함수도 작성할 수 있을까요? 물론이죠.

```c
int (*bar())[8];
```

| **`int`** | `[8]` | `*` | `()` |

다만 타입 조합을 아무렇게나 할 수는 없고, 제한이 있습니다.

* 함수의 배열을 만들 수 없습니다. 함수 포인터의 배열은 가능합니다.

	```c
int foo[8](); // 'foo' declared as array of functions of type 'int ()'
```

* 함수는 기본 타입이나 포인터만을 반환할 수 있습니다. 이를 우회하려면 배열 대신 포인터, 함수 대신 함수 포인터를 반환하도록 고치면 됩니다.

	```c
int foo()[5]; // function cannot return array type 'int [5]'
int *foo(); // OK, decayed into 'int *'
char (*bar()[2])(int); // function cannot return array type 'char (*[2])(int)'
char (**bar())(int); // OK, decayed into 'char (**)(int)'
int baz(int x)(int); // function cannot return function type 'int (int)'
int (*baz(int x))(int); // OK, decayed into 'int (*)(int)'
```

* 함수의 매개변수로도 포인터만을 전달할 수 있습니다. 코드상에는 함수와 배열을 허용하지만, 컴파일될 때 배열일 경우 포인터로, 함수일 경우 함수 포인터로 일괄 변환됩니다.

	```c
int foo(int *a, int b[], int c(int), int d[4][4]);
// converted to int foo(int *a, int *b, int (*c)(int), int (*d)[4]);
```

배열을 포인터로, 함수를 함수 포인터로 바꾸는/바꿔야 하는 동작이 공통적으로 보입니다.C++를 써보신 분이라면 [뭔가 익숙할 것 같네요!](https://en.cppreference.com/w/cpp/types/decay) [과거에는 배열을 통째로 복사하는 게 느려서](https://twitter.com/rvalueref/status/1336736877429227521) 배열 복사를 최대한 지양해야 했고, 함수는 애초에 크기를 알 수 없어 복사도 불가능하니 포인터를 대신 넘기도록 했을 거라는 추측이 가능하겠습니다.

이러한 "decaying" 현상 때문인지는 몰라도 문법적으로 함수 포인터를 함수처럼, 포인터를 배열처럼 쓸 수 있습니다.

```c
int fn(), (*fn_ptr)() = fn; // &fn
fn(); fn_ptr(); // function (pointer) call

int arr[8], *ptr_to_arr = arr;
arr[4]; ptr_to_arr[4]; // array/pointer access
arr + 4; ptr_to_arr + 4; // array/pointer arithmetic
```

이외에 유의할 점으로, 매개변수가 없을 경우(`int x();`)에도 인자를 넣을 수 있습니다(`x(123)`). 매개변수가 `void`인 경우(`int x(void);`)에는 명시적으로 인자를 넣을 수 없다는 의미가 됩니다. 이런 동작은 K&R C 시절의 레거시라고 합니다.

#### TODO: 가변 인자?

# 새로운 `BaseType` 만들기

지금까지 `BaseType`에 기본 타입이 오는 예시만을 들었었는데, 유저가 직접 새로운 `BaseType`을 정의할 수 있습니다.

## `typedef`

`typedef` 선언의 기본 형태는 다음과 같습니다.

```c
typedef BaseType declarator;
```

그냥 선언에 `typedef`만 붙이면 `typedef` 선언이 되며, 그 타입을 갖는 변수가 아니라 그 타입과 의미가 같은 새로운 타입을 선언합니다. 예를 들어 `typedef int *Foo[8];`을 하면 타입 `Foo`는 타입 이름 `int *[8]`과 같은 의미가, 변수 선언 `Foo *x;`는 `int *(*x)[8];`과 같은 의미가 됩니다.

`typedef` 선언도 한꺼번에 여러 개를 선언할 수 있는데, 이를 잘 활용하면 아래와 같이 연결 리스트 타입을 선언하면서 그 타입에 대한 포인터도 한꺼번에 선언할 수 있습니다.

```c
typedef struct List {
    int value;
    struct List *next;
} ListNode, *ListPtr;
```

`typedef`로 함수 타입도 선언할 수 있고, 타입 체킹도 올바르게 됩니다. 이런 형태는 함수 원형에만 쓸 수 있고, 정의할 때는 괄호가 필요하기 때문에 불가능합니다.

```c
typedef int IntFn(int);

IntFn foo;

int foo(int x) { // OK
   return x;
}
int foo(long x) { // conflicting types for 'foo'
   return x;
}
IntFn foo { // expected ';' after top level declarator
    return 0;
}
```

## 구조체, 공용체, 열거형

위 3종류의 타입은 유저가 직접 정의할 수 있으며, 일단 선언하고 나면 다음과 같은 형태로 쓸 수 있습니다.

* 구조체: `struct Foo` (`Foo`가 아닙니다!)
* 공용체: `union Foo`
* 열거형: `enum Foo`

실제 이름 앞에 `struct`-`union`-`enum` 부분이 공통적으로 들어가는데, 이 부분을 떼고 `Foo`로만 쓰려면 명시적으로 `typedef`를 해야 합니다. 또한 이름만 같은 `struct`-`union`-`enum` 타입을 동시에 정의할 수는 없습니다.

```c
struct Foo {}; // OK, struct Foo
typedef struct Foo Foo; // OK, Foo = struct Foo
union Foo {}; // use of 'Foo' with tag type that does not match previous declaration
```

구조체, 공용체, 열거형은 특이하게 위와 같은 정의 구문을 바로 `BaseType`으로 쓸 수도 있기 때문에 크게 다음과 같은 4가지 형태로 쓸 수 있습니다.

* `struct {...};` (가능은 하지만 딱히 의미가 있는 코드는 아님)
* `struct {...} var;` (익명으로 정의하고 선언)
* `struct Foo {...};` (정의만 하고 나중에 선언할 수 있음)
* `struct Foo {...} var;` (정의와 동시에 선언)

### 구조체

구조체는 여러 개의 멤버를 하나의 타입으로 묶은 구조입니다. 모든 멤버는 각각 고유한 값을 가질 수 있습니다. 다음과 같이 정의할 수 있습니다.

```c
struct StructName { // StructName은 생략할 수 있음
	// 멤버 선언 여러개...
};
```

#### 비트 필드

구조체 내부에서는 비트 필드 기능을 이용해 변수를 비트 단위로 끊어서 사용하는 것이 가능합니다. 비트 필드에 사용할 수 있는 타입은 다음과 같습니다.

* `unsigned int` 및 `signed int`
* `int`: 비트 필드 맥락에서는 `char`와 같이 `unsigned`나 `signed` 중 하나가 될 수 있습니다.
* `_Bool`
* 이외 컴파일러에서 지원하는(implementation-defined) 타입

멤버 변수 옆에 `: (비트 수)`를 추가함으로써 그만큼의 비트만 사용하는 멤버를 선언할 수 있습니다. 비트 필드 변수가 연속될 경우 메모리에서 연속된 비트를 사용합니다. 비트 수는 기저에 있는 타입의 비트 수를 초과할 수 없습니다.

```c
// int가 32비트임을 가정합니다.

struct Foo {
	unsigned int
		a: 7, // 7 bits; 0...127
		b: 3; // 3 bits; 0...7
	// 22 bits unused
	unsigned int c: 33; // width of bit-field 'c' (33 bits) exceeds with of its type (32 bits)
};
```

변수명을 생략하면 원하는 수의 비트를 "낭비할" 수 있습니다.

```c
struct Foo {
	unsigned int
		: 7, // 7 bits unused
		b: 3; // 3 bits; 0...7
	// 22 bits unused
};
```

변수명이 생략된 0비트짜리 비트 필드를 선언하면 그 다음 비트 필드 변수는 연속된 비트를 사용하지 않고 강제로 새로운 비트를 사용합니다.

```c
struct Foo {
	unsigned int
		x: 4, // 4 bits; 0...15
		: 0, // 28 bits unused
		y: 4; // 4 bits; 0...15
	// 28 bits unused
};
```

#### 가변 길이 구조체 *(C99~)*

구조체에 멤버가 하나 이상 있을 경우, 마지막에 불완전한 배열 멤버를 하나 더 선언할 수 있습니다. 이때 구조체의 크기는 마지막 배열을 포함하지 않으며, 그 크기 이상의 메모리를 할당할 경우 남은 공간은 마지막 배열이 차지합니다.

```c
struct Foo {
	int x, y[];
};

// struct Foo but y behaves like int [4]
struct Foo *foo = malloc(sizeof(struct Foo) + 4*sizeof(int));
foo->y[3] = 123;
```

#### 익명 구조체/공용체 *(C11~)*

구조체 안에 익명 구조체 멤버를 선언할 때는 멤버의 이름을 생략할 수 있습니다. 이때는 안쪽 멤버를 바깥쪽 멤버인 것처럼 사용할 수 있습니다. 이는 공용체에도 해당되며, 두 종류를 섞어서 사용할 수도 있습니다.

```c
struct Foo {
	struct {
		int a;
		int b;
	}; // anonymous struct
	int c;
};

struct Foo foo;
foo.a = 1; // foo.(anonymous).a
foo.b = 2; // foo.(anonymous).b
foo.c = 3; // foo.c
```

### 공용체

구조체와 같이 여러 개의 멤버를 선언할 수 있지만, 모든 멤버가 같은 메모리를 공유하며 한 멤버에 대입하면 다른 멤버의 값이 덮어씌워집니다.

```c
union Foo {
	char x, y[16];
};

union Foo foo;
strcpy(foo.y, "foo");
// foo.x is now 'f'
```

### 열거형

구조체와 공용체와는 조금 다른데, 여러 가지 원소를 정의하고 그 중에 하나를 사용할 수 있도록 합니다. 내부적으로는 그 열거형의 모든 값을 표현할 수 있는 `char` 혹은 정수형 중 컴파일러가 정하는(implementation-defined) 타입처럼 동작합니다.

```c
enum Foo {
	Bar,
	Baz,
	Quux
};

enum Foo foo = Bar;
foo = 5; // OK
```

열거형의 첫 원소의 값은 0이며, 따로 정하지 않을 경우 (이전 원소의 값) + 1의 값을 가집니다. `= (값)`을 추가해서 강제로 다른 값으로 설정할 수 있습니다.

```c
enum Foo {
	A, // 0
	B, // 1
	C = 123, // 123
	D // 124
};
```

# 선언 형태와 이름 형태

지금까지 C 타입을 '선언 형태'로만 작성했는데, 가끔씩 다른 형태로 타입을 작성해야 할 필요가 있습니다.

```c
int *x;
return (void *)y;
```

2번째 줄과 같은 모양을 타입 이름(type name)이라 하는데, 선언 형태에서 식별자와 세미콜론만 지우면 됩니다! 예를 들어 `int (*x[8])(void);`의 타입 이름은 `int (*[8])(void)`가 됩니다.

단 이 방법이 먹히지 않을 때가 있는데, 식별자가 단독으로 괄호로 둘러싸여 있었다면(`int (foo)(void);`) 식별자를 지우고 나서는 함수 괄호로 취급됩니다(`int ()(void)`). 식별자가 없어지면서 빈 괄호에 다른 의미가 부여된 건데, 이런 현상을 막기 위해서 불필요한 괄호는 지우는 것을 권장드립니다.

여담이지만, 저는 이런 이유로 `sizeof(int*)`조차도 `sizeof(int *)`가 맞다고 봅니다. 물론 `sizeof(int )`는 용납을 못 합니다.

# 검증자

## `const`

## `volatile`

## `restrict` *(C99~)*

## `_Atomic` *(C11~)*

# 기억 영역

# 불완전 타입

# 타입 변환

[^fn-c11-behavior]: C17 개정판의 특성상 대표적인 C 컴파일러인 [GCC](https://gcc.gnu.org/onlinedocs/gcc-10.2.0/gcc/Standards.html#C-Language)와 [Clang](https://clang.llvm.org/docs/UsersManual.html#differences-between-various-standard-modes)의 문서에는 `__STDC_VERSION__` 매크로를 제외하고 모든 기능이 C17과 같다고 명시하고 있습니다.
[^fn-devcpp]: 좀 더 정확히 얘기하자면, Dev-C++는 컴파일에 TDM-GCC를 씁니다. 이전 버전 Dev-C++는 딸려오는 TDM-GCC도 이전 버전인데(4.x.x), 이때는 [플래그를 지정하지 않으면 C89 표준에 컴파일러 확장을 허용하여 컴파일을 했었습니다](https://gcc.gnu.org/onlinedocs/gcc-4.9.4/gcc/Standards.html#Standards).
[^fn-answer-1]:
	| **`float`** | `*` | `*` | `[8]` | `[4]` |

	("`x`는 `float`의 이중 포인터 8×4개짜리 배열")

[^fn-answer-2]:
	| **`int`** | `*` | `(int [])` | `*` |

	("`foo`는 `int`의 포인터를 반환하는, `int []`를 받는 함수의 포인터")

[^fn-answer-3]:
	| **`char`** | `*` | `*` | `[456]` | `*` | `[123]` | `*` |

	("`z`는 `char`의 이중 포인터 456개짜리 배열의 포인터 123개짜리 배열의 포인터")

[^fn-answer-4]:
	| **`int`** | `*` | `[64]` | `*` | `(char *)` | `*` |

	("`x`는 `int`의 포인터 64개짜리 배열의 포인터를 반환하는, `char *`를 받는 함수의 포인터")