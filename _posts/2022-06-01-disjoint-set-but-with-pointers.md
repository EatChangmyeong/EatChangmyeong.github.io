---
layout: post
title: "Disjoint Set에 포인터 끼얹기"
tags:
- Algorithm
comments: true
---

*이 글에서는 disjoint set을 '분리 집합'으로 번역하겠습니다.*

이번에는 비교적 짧은 개인 의견 글을 써보겠습니다.

[백준 온라인 저지](https://acmicpc.net/)에 제출하는 코드는 어차피 **맞았습니다!!**가 한 번 나오면 다시는 안 볼 코드인만큼 그렇게까지 "클린 코드"를 짜지 않아도 되는 분위기가 있습니다(아닌가요? 착각이라면 댓글로 알려주세요). 당장 저부터도 C로 백준 문제를 풀 때 `main` 함수에서 `malloc`을 하고 `free`를 안 하는 습관이 있고, 아니면 단적인 예로 테스트 케이스 번호를 기록하는 변수명을 `test_case_index`가 아니라 `n`이나 `t`로 지어도 문제만 잘 풀리면 장땡입니다. 실무에서는 당연히 이러면 안 됩니다.

글 제목에 분리 집합이 있으니 이걸 사용하는 예시를 하나 더 들자면, 백준 [1717번 "집합의 표현"](https://www.acmicpc.net/problem/1717)을 풀 때는 분리 집합에 필요한 배열을 전역 변수로 선언하는 경우가 많습니다. 실무에서는 분리 집합이 *여러 개* 필요한 경우도 있을 수 있기 때문에 이러면 안 됩니다.

```c
#include <stdio.h>

int ds[1000000];

int ds_find(int x) {
	if(x == ds[x])
		return x;
	return ds[x] = ds_find(ds[x]);
}
void ds_union(int x, int y) {
	x = ds_find(x);
	y = ds_find(y);
	ds[y] = x;
}

int main(void) {
	// 입출력
}
```

그런데 저는 이상하게 저 배열을 전역으로 선언하기 싫다는 오기가 생겨서 굳이 지역 변수로 선언하고 `ds_find`와 `ds_union`에 인자를 하나 더 넣는 짓을 자주 합니다.

```c
#include <stdio.h>
#include <stdlib.h>

int ds_find(int *ds, int x) {
	if(x == ds[x])
		return x;
	return ds[x] = ds_find(ds, ds[x]);
}
void ds_union(int *ds, int x, int y) {
	x = ds_find(ds, x);
	y = ds_find(ds, y);
	ds[y] = x;
}

int main(void) {
	int *disjoint_set = malloc(1000000*sizeof(int));

	// 입출력
}
```

이렇게 했는데도 뭔가가 "클린"하지 않은 듯한 찜찜한 느낌이 사라지지 않았는데, 일주일쯤 전에 이 찜찜함의 원인을 알았고 블로그에 쓸지 말지 고민하다가 올리기로 결심했습니다. 제가 찾은 찜찜함의 원인을 한 문장으로 요약하자면 **인덱싱을 `int`로 하고 있다**가 됩니다.

## `int`가 뭐가 어때서

> 아니 그럼 인덱싱을 `int`로 안 하면 뭘로 해요?

솔직히 이런 반응을 예상하고 있습니다. 배열 인덱싱을 `int`로 하는 게 일반적이긴 하죠. 하지만 일단 들어보세요.

최소 신장 트리를 구하는 [Kruskal의 알고리즘](https://ko.wikipedia.org/wiki/%ED%81%AC%EB%9F%AC%EC%8A%A4%EC%BB%AC_%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98)을 들어보셨을지도 모르겠습니다. 다음과 같은 순서로 진행됩니다.

1. 그래프의 각 정점마다 정점이 하나만 있는 트리를 만든다.
1. 그래프의 간선을 비용이 적은 것부터 꺼내서...
	1. 양 끝에 있는 정점이 서로 다른(즉, 연결되지 않은) 트리에 속한다면 연결해서 하나의 트리로 만든다.
	1. 그렇지 않으면 버린다.

2-1번 단계에서 정점이 어떤 트리에 속하는지, 두 트리가 서로 다른지를 확인하는 데는 보통 분리 집합을 자주 사용합니다.

한편 (주로) 격자 모양의 그래프에 대해, 간선의 비용이 적은 순서 대신 랜덤한 순서대로 꺼내서 연결하도록 알고리즘을 고치면 [*Randomized* Kruskal's algorithm](https://en.wikipedia.org/wiki/Maze_generation_algorithm#Randomized_Kruskal's_algorithm)이라는 미로 생성 알고리즘이 됩니다.

제가 2년 전에 백준을 오랫동안 놓은 적이 있었는데, 그때 사라진 감을 다시 잡아보려고 [C++로 10종류의 미로 생성 알고리즘을 구현한 적이 있습니다](https://github.com/EatChangmyeong/maze). 이때 구현했던 분리 집합을 옮겨보자면 이렇습니다.

```cpp
// maze_algorithms.hpp
class disjoint_set {
	friend class maze::structure;
	
	int width, height;
	std::vector<std::vector<std::pair<int, int> > > set;
	disjoint_set(int w, int h);
public:
	bool join(std::pair<int, int> a, std::pair<int, int> b);
	std::pair<int, int> find(std::pair<int, int> a);
};
```

```cpp
// maze_algorithms.cpp
// using coord = std::pair<int, int>;
disjoint_set::disjoint_set(int w, int h):
	width(w), height(h),
	set(width) {
		for(int i = 0; i < width; i++) {
			set[i].resize(height, std::make_pair(i, 0));
			for(int j = 0; j < height; j++)
				set[i][j].second = j;
		}
	}
bool disjoint_set::join(coord a, coord b) {
	const coord aroot = find(a), broot = find(b);
	if(aroot == broot)
		return false;
	set[broot.first][broot.second] = aroot;
	return true;
}
coord disjoint_set::find(coord a) {
	coord &y = set[a.first][a.second];
	return y == a ? a : (y = find(y));
}
```

인덱싱을 **`std::pair<int, int>`**(aka `coord`)로 하고 있네요! 2차원 미로 생성에 쓸 코드인데 아니 그럼 인덱싱을 `std::pair<int, int>`로 안 하면 뭘로 해요?

삼천포가 좀 길어졌는데, 여기서 제가 하고 싶었던 말은 "분리 집합 인덱싱을 `int` 말고 다른 타입으로 하는 것도 마냥 비현실적인 것은 아니다"였습니다. 그럴 일은 자주 없겠지만 `std::pair<int, int>` 이외에도 `std::tuple<int, int, int>`나 `std::string` 같은 이상한 타입으로 인덱싱을 하는 것도 충분히 생각할 수 있고, 그때마다 분리 집합 알고리즘을 처음부터 다시 짜야 하는 문제가 생깁니다.

## 포인터로 인덱싱하기

글 제목을 기억하고 계신가요? 혹시 인덱싱을 아예 **포인터**로 해보면 어떨까요? 위에 적었던 백준 1717번 코드를 수정하면 이렇게 됩니다.

```c
#include <stdio.h>
#include <stdlib.h>

struct DisjointSet {
	struct DisjointSet *parent;
	// T value; // 노드에 값을 기록한다면 원소를 추가로 넣을 수 있습니다.
};

struct DisjointSet *ds_find(struct DisjointSet *ds, struct DisjointSet *x) {
	if(x == x->parent)
		return x;
	return x->parent = ds_find(ds, x->parent);
}
void ds_union(struct DisjointSet *ds, struct DisjointSet *x, struct DisjointSet *y) {
	x = ds_find(ds, x);
	y = ds_find(ds, y);
	y->parent = x;
}

int main(void) {
	struct DisjointSet *disjoint_set = malloc(1000000*sizeof(struct DisjointSet));

	// 입출력
}
```

아무런 문제 없이 잘 되네요! 게다가 코드를 잘 보면 `ds_find`와 `ds_union`의 첫 인자는 아예 필요가 없어졌으니 지워도 됩니다. "부모가 없음" 조건을 자기 자신의 포인터 대신 널 포인터와 비교하도록 고쳐도 좋을 것 같습니다.

```c
struct DisjointSet *ds_find(struct DisjointSet *x) {
	if(x->parent == NULL)
		return x;
	return x->parent = ds_find(x->parent);
}
void ds_union(struct DisjointSet *x, struct DisjointSet *y) {
	x = ds_find(x);
	y = ds_find(y);
	y->parent = x;
}
```

`.parent`를 널 포인터로 초기화하면 C에서 배열을 초기화할 때 나머지 원소를 알아서 초기화해주는 기능을 활용할 수 있습니다.

원래 분리 집합 배열을 전달받던 인자 `ds`가 없어졌다는 것은 동시에 `ds_find`와 `ds_union`을 호출하고 실행하는 데 **`struct DisjointSet`들의 배치는 전혀 상관이 없다**는 의미이기도 합니다. 일차원 배열이 아니라 이차원 배열에 늘어놓아도 되고...

```c
struct DisjointSet arr[5][5] = { { { NULL } } };
```

`std::map`에 늘어놓아도 되고...

```cpp
// DisjointSet에 적당히 초기화를 해주는 생성자가 있다고 가정합니다
std::map<std::string, DisjointSet> ds;
ds["eatch"] = DisjointSet();
ds["unionfind"] = DisjointSet();
ds_union(&ds["eatch"], &ds["unionfind"]);
```

심지어는 서로 다른 배열끼리 상호작용을 시킬 수도 있습니다.

```c
struct DisjointSet a[5] = { { NULL } }, b[5] = { { NULL } };
ds_union(&a[2], &b[3]);
```

## 포인터 인덱싱의 단점

물론 모든 분리 집합을 이렇게 구현해야 한다고 주장하려는 것은 아닙니다. 위에서 잠깐 살펴봤듯이 포인터로 인덱싱하는 분리 집합은 `int`보다 훨씬 유연하게 사용할 수 있지만, 단점 역시 명확합니다(블로그에 올리려다가 고민한 것도 이것 때문입니다). 발견한 지 겨우 일주일이 조금 넘었으니 틀릴 수도 있는 점은 감안해 주세요.

* 포인터(64비트 환경에서는 보통 64비트)의 크기가 보통 `int`(최소 16비트, 일반적으로 4바이트 = 32비트)보다 크다.
* 집합의 원소를 한 번 만들면 이동할 수 없다.
	* 원소를 이동하려면 그 원소를 가리키는 포인터를 전부 수정해야 합니다. 자기 자신을 가리키는 모든 원소를 기록하고 있지 않다면 불가능하거나 매우 어렵습니다.
	* 새로운 위치로 내용을 복사하고 기존 원소의 `.parent`가 복사한 새 원소를 가리키도록 설정하는 방법도 가능해 보입니다. 굳이 그렇게까지 해야 되는지는 모르겠네요.
* 그리고 솔직히... `int`만으로 충분한 경우가 너무 많다.

그래도 자신과 같은 모양의 무언가를 `int` 대신 포인터로 인덱싱한다는 아이디어 자체는 그래프와 관련된 다른 자료구조/알고리즘에도 적용할 수 있을 것 같습니다.

도움이 될지는 모르겠지만 재밌게 읽어주셨기를 바랍니다. 감사합니다 🙇‍♂️