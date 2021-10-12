---
layout: post
title: "C++ 반복자는 왜 그렇게 헷갈리는 걸까?"
cover_image: "/assets/post-images/text-cursor.gif"
edited_at: 2021-10-12
tags:
- C++
- Language
- Interactive
style: "/assets/post-styles/why-are-cpp-iterators-so-confusing.css"
script: "/assets/post-scripts/why-are-cpp-iterators-so-confusing.js"
comments: true
---

{::comment}&#41;은 VS Code에서 맞는 괄호 하이라이팅을 부숴먹지 않기 위해 닫는 괄호 대신 사용했습니다. 혹시 EatChangmyeong/EatChangmyeong.github.io에서 오셨다면 이 건으로 이슈나 풀 리퀘를 넣지 말아 주세요.{:/}

**이 글은 단축링크 <https://eatch.dev/s/iter>로도 들어올 수 있습니다.**

**이 글은 키보드로만 조작할 수 있는 인터랙티브 요소를 포함하고 있으며, 모바일 환경에 최적화되지 않았습니다. PC로 열람을 권장합니다.**

에츠허르 다익스트라는 [Why numbering should start at zero](https://www.cs.utexas.edu/users/EWD/transcriptions/EWD08xx/EWD831.html)라는 서한을 남긴 적이 있습니다. 전체 내용은 [별도의 보충글](/2021/08/09/why-numbering-should-start-at-zero.html)에 정리해 두었고, 이 중 글과 관련이 있는 부분을 발췌하면 이렇습니다.

> 자연수의 부분수열 2, 3, ..., 12를 끔찍한 줄임표 없이 나타낼 때, 다음과 같은 4종류의 방식을 고를 수 있다.
>
> * a&#41; 2 &le; i < 13
> * b&#41; 1 < i &le; 12
> * c&#41; 2 &le; i &le; 12
> * d&#41; 1 < i < 13
>
> *(중략)*
>
> 자연수에는 최솟값이 존재한다. b&#41;와 d&#41;와 같이 하한을 제외할 경우 가장 작은 자연수부터 시작하는 부분수열의 하한이 비자연수가 되어야 한다. 이는 더러우니 하한은 a&#41;와 c&#41;처럼 &le;로 표기하는 것을 선호한다. 한편 가장 작은 자연수부터 시작하는 부분수열을 생각하자. 상한을 포함할 경우 부분수열이 빈 수열이 되었을 때 상한이 비자연수가 되어야 한다. 이는 더러우니 상한은 a&#41;와 d&#41;처럼 <로 표기하는 것을 선호한다. 이로써 방식 a&#41;를 가장 우선하는 것으로 결론지을 수 있다.
>
> *(후략)*

요즘 들어서는 $$a \le i < b$$ 대신 $$a \le i < a + l$$으로 타협(?)하는 분위기가 보이고 있는데 개인적으로 이 글의 논지에 꽤 공감하는 편입니다.

제목에 C++ 반복자를 써놓고 갑자기 이 글을 인용한 이유는, C++ 반복자가 헷갈리는 이유를 이 글의 내용으로 어느 정도 설명할 수 있기 때문입니다.

* **왜 $$\left[ \mathrm{begin}, \mathrm{end} \right)$$ 범위인가?** - 위 글에서 방식 a&#41;가 가장 합리적임을 설명했다.
* **past-the-end 위치는 왜 있는가?** - `for`문을 돌 때 탈출 조건을 확인하기 편하며, 방식 a&#41;와도 자연스럽게 연결된다.
* **[`std::lower_bound`](https://en.cppreference.com/w/cpp/algorithm/lower_bound)와 [`std::upper_bound`](https://en.cppreference.com/w/cpp/algorithm/upper_bound)의 정의는 도대체 왜 그런가?** - [`std::equal_range`](https://en.cppreference.com/w/cpp/algorithm/equal_range)의 반환값이 $$\left[ \mathrm{begin}, \mathrm{end} \right)$$ 범위가 되도록 하는 정의이다. 그런데 왠지 찜찜하다...?
* **역방향 반복자는 왜 한 칸 뒤를 참조하는가?** - 네????????

완벽하지는 않네요.

이 네 가지 의문점이 제가 STL을 처음 배우면서 가장 헷갈렸던 부분인데, 위 글의 내용과는 별개로 [네이버 블로그](https://blog.naver.com/dlaud5379/221896362168)에 나름대로 이유를 찾아서 올린 적이 있습니다. 이제 이 블로그를 주력으로 사용하고 있으니 해당 글의 내용을 다시 정리해서 올려보려고 합니다.

# 다른 멘탈 모델로 보기

다들 모르는 개념을 배우면서 멘탈 모델을 하나씩은 만드실 거라고 생각합니다. 예를 들어서 제가 반복자를 처음 배울 때의 멘탈 모델 중 하나가 **마인크래프트 핫바**였습니다.

![마인크래프트에서 핫바의 모습. 9개의 사각형이 가로로 붙어 있고 이 중 일부에 아이템이 들어 있다. 선택되어 있는 아이템이 더 크고 밝은 사각형으로 강조되어 있다.](/assets/post-images/minecraft-hotbar.png)

생각해보면 반복자와 핫바로 할 수 있는 것들이 꽤 비슷합니다.

* 읽기 연산 = 아이템 확인 (이거는 조금 당연하니 생략합시다.)
* 쓰기 연산 = 아이템 장착, 사용, 장착 해제...
* 증감 = 마우스 휠
* 임의 접근 = 단축키 1~9

사실 이렇게 의식적으로 생각하면서 멘탈 모델을 정했다기보다는 그동안 마인크래프트를 오래 해와서 친숙하니 반복자를 보자마자 '어 이거 마인크래프트 그거랑 비슷하다'부터 나온 것에 가깝습니다. 여러분도 비슷한 경험이 있는지 모르겠네요.

유감스럽지만, 이 멘탈 모델을 받아들이면 글의 위에서 언급한 "헷갈리는 부분"에 부딪쳐버리게 됩니다.

* "past-the-end 위치라니? 마인크래프트엔 그런 거 없었는데?"
* "정렬 함수를 부르는데 왜 $$\left[ \mathrm{begin}, \mathrm{end} \right)$$ 범위를 받지? past-the-end 어쩌고랑 관련이 있나? 뭐 그렇다고 쳐야지"
* "`value`보다 큰 첫 원소를 가리키는 반복자? 이게 어딜 봐서 상계야"
* "역방향 반복자는 한 칸 앞을 가리킨다고? 아니 또 왜?"

프로그래밍 개념을 이해하는 데 이왕이면 더 명확하고 간단한 멘탈 모델이 낫다고 설명할 필요는 아마 없을 것 같습니다(자꾸 헷갈리면 답답하잖아요!). 그러면 마인크래프트 핫바보다 반복자를 더 깔끔하게 설명할 수 있는 멘탈 모델이 있을까요? 생각보다 훨씬 가까이 있습니다. **텍스트 커서를 소개합니다.**

![](/assets/post-images/text-cursor.gif)

## 가산 및 감산

텍스트 커서가 반복자랑 무슨 상관일까요? 일단 텍스트 커서로 뭘 할 수 있는지부터 살펴봅시다. 편의상 여기서부터는 "커서"라고만 하면 마우스 커서가 아니라 텍스트 커서를 일컫는 것으로 하겠습니다.

<div data-script='{ "insertable": false, "writable": false, "random": false }'></div>

**바로 위의 이 배열은 인터랙티브입니다!** 클릭하고 좌우 방향키를 눌러보세요. 색상이 살짝 진해졌다면 포커스가 제대로 잡힌 상태입니다.

텍스트 편집을 하려면 어디를 편집하는 것인지 알 수 있어야겠죠. *좌우 방향키로 커서를 움직일 수 있습니다*. 이는 [양방향 반복자](https://en.cppreference.com/w/cpp/named_req/BidirectionalIterator)의 증감 연산과 동일합니다.

## 임의 접근

한 칸씩만 움직일 수 있으면 지루하겠죠. *마우스로 편집하고 싶은 위치를 누르면 커서가 바로 그 위치로 이동합니다.* 이는 [임의 접근 반복자](https://en.cppreference.com/w/cpp/named_req/RandomAccessIterator)의 덧·뺄셈 연산(특히 `.begin() + x`)과 동일합니다.

<div data-script='{ "insertable": false, "writable": false }'></div>

## 덮어쓰기

지금은 사라지고 있는 추세지만, 일부 텍스트 편집기나 워드 프로세서에서는 Insert 키를 눌러서 삽입 모드(Insert)와 수정 모드(Overtype)를 오갈 수 있습니다.

![수정 모드에서 "stdlib"의 맨 앞에 커서를 두고 "string"으로 편집하고 있다.](/assets/post-images/text-overwrite.gif)

삽입 모드는 우리가 항상 쓰고 있는 익숙한 모드입니다(문자와 문자 사이에 새로운 문자를 삽입함). 수정 모드로 들어가면 커서가 세로선이 아니라 블록 모양으로 반짝이고, 키보드를 치면 **그 칸에 있던 문자가 지워지고 입력한 문자로 바뀝니다**.

<div data-script='{}'></div>

*Insert를 누르고 숫자키 0-9를 눌러서*(키패드 여부는 상관 없습니다) 수정 모드를 체험해볼 수 있습니다. 이는 [출력 반복자](https://en.cppreference.com/w/cpp/named_req/OutputIterator)의 쓰기 연산과 동일합니다(`*it = x;`). 이 상태에서 Insert를 한 번 더 누르면 실제 텍스트 에디터와 동일하게 숫자키를 누르면 커서가 한 칸 오른쪽으로 옮겨갑니다(`*it++ = x;`와 같이 작동합니다).

Insert를 한 번 더 누르면 삽입 모드로 돌아갑니다. C++에서는 [배열 중간에 삽입하는 연산도 반복자로 할 수는 있지만](https://en.cppreference.com/w/cpp/iterator/insert_iterator), 이 글에서는 글의 주제에 집중하기 위해 입력을 막았습니다. ~~사실 배열 길이도 바뀌게 짜기 귀찮네요.~~

### 역방향 반복자

그런데 위의 배열에서 Insert를 누르고 자세히 살펴보면 세로선 커서가 있던 곳의 **오른쪽**이 반짝입니다. 커서를 가장 왼쪽에 두면 첫 번째 원소를 수정할 수 있고, 가장 오른쪽(즉, "past-the-end" 위치)에 두면 애초에 수정할 것이 없습니다. 반복자의 동작과 잘 들어맞네요.

수정 모드에서 커서의 오른쪽이 아니라 **왼쪽**이 반짝거리도록 할 수 있다면 역방향 반복자도 어느 정도 설명할 수 있을 것 같습니다. 마침 [**오른쪽에서 왼쪽으로 쓰는 문자 체계**](https://en.wikipedia.org/wiki/Right-to-left_script)가 있네요. 아랍어나 히브리어 등이 여기에 속하는데, 이 언어로도 컴퓨터를 쓸 수 있어야 되기 때문에 텍스트 에디터도 여기에 대응하고 있습니다. 가령...

* 커서가 오른쪽에서 시작하고 글을 쓰면 왼쪽으로 움직인다.
* Home 키를 누르면 커서가 가장 오른쪽으로, End 키를 누르면 가장 왼쪽으로 움직인다.
* 커서에 *방향 표시가 생긴다*. 거짓말 같지만 진짜입니다.
	* 커서가 진행하는 방향으로 가로선이 추가로 그어집니다. LTR(left-to-right; 왼쪽에서 오른쪽으로)은 오른쪽, RTL(오른쪽에서 왼쪽으로)은 왼쪽에 방향 표시가 있습니다.
	* 직접 확인해 보고 싶다면 키보드 배열을 RTL 언어권으로 바꾸거나 파이어폭스에서 about:config를 열고 `bidi.browser.ui`를 `true`로 바꾸면 됩니다.
* 그리고 무엇보다도, **수정 모드에서 커서의 왼쪽이 반짝거린다.**

![커서의 오른쪽 위에 방향 표시가 튀어나와 있다.](/assets/post-images/bidi-cursor.gif)

이런 차이를 알고 나면 역방향 반복자를 만들었을 때 한 칸 앞의 원소를 가리키는 것이 좀 더 납득될지도 모르겠네요. 아래의 배열에서 직접 테스트해볼 수 있습니다(R 키로 방향 전환).

<div data-script='{ "reversible": true }'></div>

## 범위 지정

텍스트의 일부분을 선택하는 건 다들 해보셨을 겁니다. Visual Studio Code 같은 최신 에디터는 다중 선택을 지원하기도 하지만 가장 기본적으로는 *시작점부터 끝점까지 마우스로 끌어서 그 영역을 선택할 수 있습니다*(이외에 Shift를 이용하는 방법이 있지만 생략합니다). 이는 반복자 2개로 범위를 지정하는 것과 동일합니다. 특히 Ctrl+A로 전체 선택은 `.begin()`부터 `.end()`까지와 동일합니다.

범위 지정도 이유 없이 하지는 않겠죠. 일단 복사를 하든지, 지우든지, 글자 크기 조정을 하든지 무언가 그 범위에서 하고 싶은 것이 있을 겁니다. `<algorithm>`에서 제공하는 여러 함수들이 이렇게 반복자 2개로 범위를 받고 그 안에서 연산을 합니다. 이 범위가 방식 a&#41;와 같으니 자연스럽게 $$\left[ \mathrm{begin}, \mathrm{end} \right)$$ 범위가 됩니다.

<div data-script='{ "selectable": true }'></div>

### 상한과 하한

`std::lower_bound`와 `std::upper_bound`의 헷갈리는 정의 역시 커서 멘탈 모델로 생각해볼 수 있습니다.

* `std::lower_bound`: `value`보다 작지 않은 첫 원소
	* 즉, `element < value`인 것과 그렇지 않은 것 사이에 커서가 들어간다.
* `std::upper_bound`: `value`보다 큰 첫 원소
	* 즉, `element > value`인 것과 그렇지 않은 것 사이에 커서가 들어간다.

즉 이 두 함수는 `value`보다 작은 것, `value`와 같은 것, `value`보다 큰 것을 분할해주며, 이 두 함수만을 이용해 구현한 `std::equal_range`는 정확히 `value`와 같은 범위를 돌려준다는 것을 이해할 수 있습니다. 아래 배열에서 직접 테스트해볼 수 있습니다(Alt+숫자 키로 `std::equal_range`만큼 선택).

<div data-script='{ "insertable": false, "writable": false, "selectable": true, "bounds": true, "sorted": true }'></div>

# 복습해보기

지금까지 언급했던 모든 내용을 정리해 봅시다. 반복자와 커서로 비슷하게 할 수 있는 것들이 마인크래프트 핫바보다 훨씬 다양합니다.

* 읽기 연산 (생략합시다.)
* 쓰기 연산 = 텍스트 입력
	* 덮어쓰기(`*it = x;`) = 수정 모드
	* 본문에 언급하지는 않았지만 삽입하기([`std::insert_iterator`](https://en.cppreference.com/w/cpp/iterator/insert_iterator), [`std::front_insert_iterator`](https://en.cppreference.com/w/cpp/iterator/front_insert_iterator), [`std::back_insert_iterator`](https://en.cppreference.com/w/cpp/iterator/back_insert_iterator)) = 삽입 모드
* 증감 = 방향키로 이동
* 임의 접근 = 마우스 클릭으로 이동
* 범위 지정 = 텍스트 선택
	* `<algorithm>`의 반복자 범위를 받는 함수 = 선택한 텍스트로 무언가 실행
* 역방향 반복자 = RTL 커서

이 유사점들을 전부 확인해볼 수 있도록 아래 배열에 모든 기능들을 켜 두었습니다. Alt+숫자 키를 입력하면 선택하기 전에 정렬을 먼저 수행합니다.

<div data-script='{ "selectable": true, "bounds": true, "reversible": true }'></div>

실제로 제가 커서 멘탈 모델을 받아들이고 난 뒤에 광명을 찾았습니다. 이외에도 다른 효능을 들자면...

* `std::equal_range`를 더 잘 쓸 수 있게 되었습니다.
* 백준 문제를 덜 헷갈리면서 풀 수 있게 되었습니다.
* $$a \le i < b$$ 범위의 신봉자가 되었습니다.
	* C 등 다른 언어에서도 무조건 이 범위만을 사용하고 있습니다.
* 이 글을 써보려고 히브리어 IME를 설치해서 실제로 커서가 바뀌는지 테스트해봤습니다.
* 소화불량이 해결되었습니다. (농담입니다.)

다음번에 C++로 프로그래밍할 때는 커서를 떠올려보는 게 어떨까 싶네요.