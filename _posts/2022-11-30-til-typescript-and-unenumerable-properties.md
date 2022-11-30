---
layout: post
title: "TIL: 타입스크립트와 열거 불가능한 속성"
tags:
- TypeScript
- TIL
comments: true
---

<blockquote class="twitter-tweet" data-dnt="true"><p lang="ko" dir="ltr">저는 타입스크립트를 쓰면서 enumerable이 false인 속성을 넣지 않겠습니다.<br>저는 타입스크립트를 쓰면서 enumerable이 false인 속성을 넣지 않겠습니다.<br>저는 타입스크립트를 쓰면서 enumerable이 false인 속성을 넣지 않겠습니다.</p>&mdash; 잇창명 EatChangmyeong🪖 ~ 240207 (@EatChangmyeong) <a href="https://twitter.com/EatChangmyeong/status/1597830156647018498?ref_src=twsrc%5Etfw">November 30, 2022</a>
</blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

오늘은 TypeScript를 쓰다가 좀 커다란 시행착오를 했습니다.

# 문제 상황

프론트엔드와 백엔드 사이에 이런 데이터를 JSON으로 교환해야 한다고 칩시다. 실제로는 더 복잡한 정보를 교환했는데 설명의 편의상 더 단순한 예시를 만들었습니다.

```typescript
// 여러 `DataExchange`가 공통으로 가지고 있는 무거운 데이터입니다.
type DataExchangeBase = {
	foo: string,
};

// 이 데이터를 교환합니다.
// `bar` 값만으로 `base`를 완전히 복구할 수 있기 때문에
// 이론상 `base`는 들고 있지 않아도 되지만,
// 그 복구하는 과정이 귀찮기 때문에 속성으로 넣어 두었습니다.
type DataExchange = {
	bar: number,
	base: DataExchangeBase,
};
```

`DataExchange`를 교환할 때는 `DataExchangeBase`도 같이 따라다니는데, 아무래도 중복되고 무거운 데이터다 보니까 JSON으로 만들 때 같이 보내고 싶지 않습니다. 저는 [`JSON.stringify`](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#%EC%84%A4%EB%AA%85) 문서를 보고 이렇게 생각했습니다.

> `base`를 `enumerable`하지 않게 만들면 `JSON.stringify`에서 빠지겠구나!

## `enumerable: false` 해결책

이 방법을 바로 실행으로 옮겨봤는데...

```typescript
// JSON에서 갓 파싱해 온 `base`가 없는 값
type DataExchangeParsed = {
	bar: number,
};

function inject_base(parsed: DataExchangeParsed): DataExchange {
	Object.defineProperty(parsed, 'base', {
		value: { foo: 'test' }, // 시연용이기 때문에 아무 값이나 넣었습니다.
		enumerable: false,
	});
	return parsed as DataExchange;
}

function new_data_exchange(bar: number): DataExchange {
	return inject_base({ bar });
}

const data_exchange: DataExchange = new_data_exchange(1);
// { bar: 1, base: { foo: "test" } }
console.log(JSON.stringify(data_exchange))
// {"bar":1}

// JSON에서 도로 `DataExchange`로 만들 때는 이렇게 합니다. 올바른 문자열만 들어온다고 가정합니다.

function hydrate(json: string): DataExchange {
	const parsed = JSON.parse(json) as DataExchangeParsed;
	return inject_base(parsed);
}

hydrate('{"bar":1}')
// { bar: 1, base: { foo: "test" } }
```

...예상치 못한 곳에서 문제가 터졌습니다. `DataExchange`를 복사할 일이 자주 생기는데...

```typescript
// 타입 검사를 통과합니다.
const cloned: DataExchange = { ...data_exchange };

console.log(cloned.base.foo);
// Uncaught TypeError: cloned.base is undefined
```

알고 보니 `enumerable`이 `false`인 속성은 객체 스프레드 문법(`{ ...object }`)에서도 [**무시합니다**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties#traversing_object_properties). 현재 TypeScript에는 [열거 불가능한 속성을 표시하는 방법이 없기 때문에](https://github.com/microsoft/TypeScript/issues/9726) 이런 경우까지 처리해줄 수 없고, 링크한 이슈 페이지를 보면 2016년에 "엣지 케이스처럼 보인다"는 부정적인 입장 이후로 지금까지 딱히 진전된 것이 없어 보입니다.

이 문제를 해결하려면 `DataExchange`를 복사할 때마다 `Object.defineProperty`를 매번 해 줘야 되는데, 이미 복사를 온갖 곳에서 하고 있고 `base`를 주입하는 과정 자체가 너무 귀찮다 보니까 애초에 타입 검사가 잘 되는 다른 방법을 쓰기로 합니다.

## `toJSON` 해결책

`JSON.stringify`될 때의 모양을 마음대로 정할 수 있는 `toJSON` 메소드를 넣기로 한 것입니다. 타입 정의부터 다시 하자면...

```typescript
type DataExchangeBase = {
	foo: string,
};

type DataExchangeParsed = {
	bar: number,
};

// `toJSON`이 새로 생겼습니다.
type DataExchange = {
	bar: number,
	base: DataExchangeBase,
	toJSON: (this: DataExchange) => unknown,
};

// 사실 이 메소드는 제네릭하게 타이핑을 하기가 어렵습니다.
// 제가 짠 실제 코드에는 `DataExchange` 말고도
// `base`를 빼고 직렬화해야 하는 타입이 많기 때문에 눈물을 머금고 `any`를 썼습니다.
// 컴파일 오류 없이 타입을 잘 매기신 분이 있다면 댓글로 제보 부탁드립니다. 감사합니다
function toJSON(this: DataExchange): unknown {
	return {
		...this,
		base: undefined,
	};
}

function inject_base(parsed: DataExchangeParsed): DataExchange {
	return {
		...parsed,
		base: { foo: 'test' },
		toJSON, // 이 메소드가 있으면 x를 그대로 직렬화하는 대신 x.toJSON()을 직렬화합니다.
	};
}

function new_data_exchange(bar: number): DataExchange {
	return inject_base({ bar });
}

const data_exchange: DataExchange = new_data_exchange(1);
// { bar: 1, base: { foo: "test" }, toJSON: toJSON() }
console.log(JSON.stringify(data_exchange))
// {"bar":1}

function hydrate(json: string): DataExchange {
	const parsed = JSON.parse(json) as DataExchangeParsed;
	return inject_base(parsed);
}

hydrate('{"bar":1}')
// { bar: 1, base: { foo: "test" }, toJSON: toJSON() }

({ ...data_exchange })
// { bar: 1, base: { foo: "test" }, toJSON: toJSON() }
```

이번에는 복제를 해도 모든 속성이 잘 따라오고, `JSON.stringify`를 해도 `base`와 `toJSON`이 빠진 채로 직렬화됩니다. 게다가 `enumerable: false`가 없기 때문에 타입 검사도 잘 되네요!

방금 이 방법으로 리팩토링한 코드를 푸시하고 오는 길인데, 다행히 심각한 버그는 없는 것 같습니다. 다행이네요.