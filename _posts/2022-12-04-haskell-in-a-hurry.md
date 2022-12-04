---
layout: post
title: "급하게 배우는 Haskell (\"검증하지 말고 파싱하라\" 보충)"
tags:
- 함수형
- Haskell
- 보충
comments: true
---

*이 글은 [검증하지 말고 파싱하라](/2022/12/04/parse-don-t-validate.html)의 내용을 보충할 목적으로 작성하는 Haskell 속성 강좌 같은 느낌의 글입니다. 글을 읽는 데 꼭 필요한 분량만 작성했기 때문에 실제로 Haskell을 학습하는 목적으로는 적합하지 않으며, 진지하게 Haskell을 배우신다면 [Haskell 공식 홈페이지](https://www.haskell.org/documentation/)에서 안내하는 학습 자료 중 하나를 골라서 읽어보는 것을 권장드립니다.*

*Haskell은 [Haskell 공식 홈페이지](https://www.haskell.org/downloads/)의 설치 가이드를 따라 설치할 수 있으며, 컴파일러는 `ghc`, 대화형 인터프리터는 `ghci`로 호출할 수 있습니다. PC에 설치하기 곤란한 경우에는 [Replit](https://replit.com/languages/haskell)에서 온라인으로 사용해볼 수 있습니다.*

---

# `Hello, world!`

다른 언어를 배울 때처럼 헬로월드부터 작성해 봅시다. Haskell로 짠 헬로월드 프로그램은 다음과 같습니다.

```haskell
main :: IO ()
main = putStrLn "Hello, world!"
```

Haskell 프로그램도 C처럼 `main`에서 시작합니다. 여기서 `main :: IO ()`는 타입 시그니처로 `main`의 타입이 `IO ()`라는 뜻이고(C의 함수 프로토타입과 비슷합니다. `IO ()`가 무슨 타입인지는 나중에 다시 얘기하겠습니다), 다음 줄의 `main = putStrLn "Hello, world!"`가 실제 `main`의 정의입니다.

# 모든 것은 함수다

Haskell은 순수 함수형 언어이기 때문에 프로그램의 거의 전체가 함수로 이루어집니다. 예를 들어서 아까 `main`에 썼던 `putStrLn`도 함수입니다.

```haskell
putStrLn :: String -> IO ()
```

여기서 `String`은 문자열 타입이고, `String -> IO ()`는 `String`을 받아서 `IO ()`를 내놓는 함수의 타입입니다.

또 C와 달리 여기서는 함수를 호출할 때 괄호를 쓰지 않고 인자를 바로 연달아서 씁니다. 아까 `main`의 정의를 다시 살펴보면 함수 `putStrLn`에 인자로 `String`인 `"Hello, world!"`를 주는 형태이고, `putStrLn`은 `String -> IO ()` 타입이니 `main`이 `IO ()`인 것이 자연스럽네요.

## 함수 만들기

여기서는 설명의 편의를 위해 `Bool` 타입으로 예시를 들어 보겠습니다. 이 타입의 값은 `True`와 `False`뿐입니다.

위에서 언급했던 `main`처럼 타입 시그니처(생략해도 됨)와 한 줄 이상의 정의를 늘어놓으면 함수를 만들 수 있습니다.

```haskell
not :: Bool -> Bool
not False = True -- 좌변에 인자를 추가로 입력하면 함수가 됩니다.
not True  = False
```

수학에서 함수를 부분부분 정의하듯이 Haskell에서도 인자의 모양을 보고 분기할 수 있습니다. `False`나 `True`보다 더 복잡한 모양으로도 분기할 수 있는데, 이를 패턴 매칭이라고 합니다.

### 인자가 많은 함수 만들기

인자가 여러 개인 함수도 만들 수 있습니다.

```haskell
and :: Bool -> Bool -> Bool -- ???
and False _ = False
and True x  = x
```

여기서 `_`와 `x`도 패턴인데, 후자는(소문자로 시작해야 합니다. 대문자면 안 됩니다) 그 자리에 오는 아무 값을 변수 `x`에 대입한다는 의미이고, 전자는 후자와 같지만 그 값에 관심이 없으니 변수에 대입하지 않고 버린다는 의미입니다.

말이 나온 김에 여기서 얘기해야 될 것 같은데 Haskell에서는 *문법 수준에서* 대소문자를 구분합니다. 즉, 대문자로 시작하는 이름과 소문자로 시작하는 이름은 문법적 의미가 다릅니다.

일단 정의하면 이렇게 쓸 수 있습니다.

```haskell
and True True -- True
and False False -- False
and True False -- False
```

여기서 `Bool -> Bool -> Bool`은 `Bool -> (Bool -> Bool)`로 묶으며, `Bool`을 받아서 *함수를* 돌려주는 함수라는 뜻입니다. 즉, 이런 것도 할 수 있습니다.

```haskell
foo :: Bool -> Bool
foo = and True
-- foo True = True, foo False = False
```

더 근본적으로는, 모든 Haskell 함수는 *인자가 하나인* 함수입니다. 다인자 함수를 이렇게 쪼개는 것을 전문 용어로 [커링](https://ko.wikipedia.org/wiki/커링)이라고 합니다.

### 함수를 받는 함수 만들기

함수를 *돌려주는* 함수가 있으면 함수를 *받는* 함수도 만들 수 있을까요?

```haskell
applyTrue :: (Bool -> Bool) -> Bool
applyTrue f = f True
```

이때는 타입 자리의 `->` 연산자가 우결합성이기 때문에 괄호를 꼭 붙여줘야 합니다.

## 연산자도 함수다

Haskell은 실 사용을 염두에 두고 개발한 프로그래밍 언어이니 당연히 정수 연산도 지원합니다. `ghci`에 다음과 같은 수식을 입력해 보세요. `--` 다음부터는 주석입니다.

```haskell
1 + 2 -- 3
3 - (-2) -- 5. 문법적 한계로 인해 음수는 괄호를 씌워야 합니다.
6 * 3 + 2 -- 20
6 + 3 * 2 -- 12. 연산자 우선순위도 지원됩니다.
```

그런데 사실 연산자도 특별한 것은 없고 그냥 이름이 특수문자인 함수일 뿐입니다.

```haskell
(+) 1 2 -- 3
(-) 3 (-2) -- 5
```

함수형 언어이니만큼 함수 합성을 하는 연산자도 정의되어 있습니다.

```haskell
(.) :: (b -> c) -> (a -> b) -> (a -> c)
(.) g f x = g (f x)
-- (not . foo) True = not (foo True) = not True = False
```

지금까지 봤던 `IO`나 `String`이나 `Bool`과는 다르게 타입 이름이 소문자로 시작하는 것을 볼 수 있는데, 이건 `a`, `b`, `c` 자리에 아무 타입이나 올 수 있다는 뜻입니다. 즉, 필요하다면 `a` = `String`, `b` = `Bool`, `c` = `Bool` 등 임의로 타입을 대입해서 그 타입인 것처럼 쓸 수 있습니다.

또 이런 연산자도 정의되어 있습니다.

```haskell
($) :: (a -> b) -> (a -> b)
f $ x = f x
```

정의만 보면 굳이 쓸데가 없어 보이는 연산이지만, 이 연산자는 `a b c` = `a (b c)`와 달리 `a b $ c` = `(a b) c`, `a $ b $ c` = `(a $ b) $ c`이도록 정의되어 있기 때문에 괄호를 쓰기 귀찮을 때 애용할 수 있습니다.

# 새로운 타입 만들기

Haskell에서는 새로운 타입을 만들 수 있는 방법을 여러 가지 제공합니다. 구체적으로는 대수적 자료형이라고 하는 것을 지원하는데, 이게 뭔지는 [이전 글](/2022/06/05/how-is-type-derivative-a-thing.html#대수적-자료형)에서 자세히 다룬 적이 있습니다.

## `data`문

`data`문으로 새로운 타입을 만들고, 그 타입이 가질 수 있는 모양도 정의할 수 있습니다. 여기서 정의한 모양들은 모두 패턴으로 사용할 수 있습니다.

```haskell
-- 아무런 모양도 가질 수 없습니다(바닥 타입).
data Void

-- `()` 타입의 모든 값은 `()` 모양입니다(단위 타입).
data () = ()

-- 위에서 봤던 `Bool` 타입이 이렇게 정의되어 있습니다.
-- `False` 모양이나 `True` 모양을 가질 수 있다는 의미입니다.
data Bool = False | True

-- `MyCoord Integer Integer` 모양을 가집니다.
-- 즉, `Integer` 타입의 값 2개를 가지고 `MyCoord 3 5`와 같이 `MyCoord`를 만들 수 있습니다.
-- 이쯤에서 눈치채셨겠지만 모든 모양은 대문자 단어로 시작하고
-- 이 "태그 단어"를 이용해서 무슨 모양인지 구별합니다.
-- 이때 `Integer`는 범위가 무한대인 정수 타입입니다.
data MyCoord = MyCoord Integer Integer
```

각 모양마다 태그 단어가 필요한 것은 태그 단어가 그 타입의 값을 만드는 *생성자 함수*의 역할을 하기 때문입니다. [연산자도 함수](#연산자도-함수다)인 점을 고려해 태그 단어로 연산자도 사용할 수 있습니다.

```haskell
-- `Nil` 모양이거나 `Integer` 1개, `IntegerList` 1개를 가지고 `Integer : IntegerList` 모양으로 만들 수 있습니다.
-- 즉, 이 타입은 `Integer`의 연결 리스트입니다.
data IntegerList = Nil | Integer : IntegerList
-- 참고로 Haskell에서는 연결 리스트 타입 `[a]`를 기본 지원합니다.

-- 점점 감이 안 올 수도 있으니 `IntegerList`를 쓰는 함수로 예시를 들어 보겠습니다.
foo :: IntegerList -> Integer
foo Nil   = 0 -- `Nil` 모양을 매치합니다.
foo (x:_) = x -- `Integer : IntegerList` 모양을 매치합니다. 우선순위로 인하여 괄호를 달아야 합니다.
```

### 타입의 함수

`data`문으로 타입의 *함수*도 만들 수 있고, 문법은 일반 함수를 정의하는 것과 비슷합니다. Haskell의 표준 라이브러리에서 지원하는 몇 가지 유용한 타입 레벨 함수를 소개해 보겠습니다.

```haskell
-- 값이 없을 수도 있는 것을 나타냅니다.
data Maybe a = Nothing | Just a

-- `a`를 가지고 있거나 `b`를 가지고 있는 것을 나타냅니다.
data Either a b = Left a | Right b

-- 참고로 아까 언급한 `[a]`도 타입 레벨 함수입니다(`[] a`).
-- `[a]`는 표준 라이브러리에 정의되어 있지 않지만, 아마 정의되었다면 이런 모양일 것입니다.
data [a] = [] | a : [a]

-- 두 개 이상의 값을 하나로 묶는 튜플 타입도 있고, GHC 기준으로 최대 62개까지 가능합니다.
-- `(a,b)`나 `(a,b,c)` 등도 표준 라이브러리에 정의되어 있지 않지만, 아마 이런 모양일 것입니다.
data (a,b) = a , b
data (a,b,c) = (,,) a b c
```

## `type`문

`type`문은 C의 `typedef`와 비슷하게 같은 타입을 다른 이름으로 쓸 수 있게 해줍니다.

```haskell
-- `MaybeInteger`와 `Maybe Integer`는 서로 바꿔 쓸 수 있습니다.
type MaybeInteger = Maybe Integer

-- 사실 맨 처음에 봤던 `String`도 타입 동의어입니다. `Char`는 문자 타입입니다.
type String = [Char]

-- 표준 라이브러리를 보면 매개변수가 파일의 경로라는 것을 명확히 나타내기 위해
-- 그냥 `String` 대신 이 타입을 사용하는 경우가 많습니다.
type FilePath = String

foo :: Maybe Integer -> Maybe Integer
foo x = x
bar :: MaybeInteger
bar = Just 1
foo bar -- OK
```

## `newtype`문

`newtype`문은 `data`문과 비슷한데, 정확히 한 가지 모양에 정확히 한 가지 필드밖에 쓸 수 없습니다.

```haskell
newtype Intish = Intish Integer
```

이렇게 보면 의미상 `type`문과 다를 바가 없는데, `type`문과의 중요한 차이점은 이렇게 새로 정의한 타입과 원래 타입을 바꿔 쓸 수 *없다는* 것입니다.

```haskell
fooInteger :: Integer -> Integer
fooInteger x = x

fooIntish :: Intish -> Intish
fooIntish (Intish x) = Intish x

fooInteger 1 -- OK
fooIntish (Intish 1) -- OK
fooInteger (Intish 1) -- 타입 오류
fooIntish 1 -- 타입 오류
```

`newtype`은 내부 표현은 같지만 의미상 바꿔 쓰면 안 되는 것들을 타입 시스템상에서 구분할 때 유용하게 쓸 수 있습니다.

# 타입 클래스로 성질 표현하기

타입 클래스라는 개념이 있는데, 말 그대로 타입 레벨의 클래스라고 하면 전혀 안 와닿을 것 같고 객체지향 언어의 인터페이스와 비슷하다고 설명하는 게 가장 좋을 것 같습니다. 예를 들어 다음은 동일성 비교가 가능한 성질을 나타내는 타입 클래스입니다.

```haskell
class Eq a where
    -- 타입 클래스의 원소들은 크게 구현해야 하는 것과 제공해주는 것으로 나뉩니다.
    -- 구현해야 할 것을 아래의 인스턴스를 통해 모두 구현하면 제공해주는 함수를 추가로 쓸 수 있습니다.
    -- `Eq`를 구현하는 타입이 있으면 그 타입에 대해 `==`나 `/=` 연산자를 쓸 수 있습니다.
    -- `/=`는 다른 언어에서의 `!=` 연산자와 같습니다.
    (==), (/=) :: a -> a -> Bool
    -- 원칙적으로 `==`와 `/=`는 구현해야 하는 것에 속하지만,
    -- 하나만 구현해두면 아래의 기본 구현체를 돌려 쓸 수 있습니다.
	-- 둘 다 생략하면 무한루프에 빠지므로 적어도 하나는 구현해야 합니다.
    x /= y = not (x == y)
	x == y = not (x /= y)

-- 이외에도 코드화할 수 없고 문서로만 명시되어 있는 불변조건이 있을 수 있기 때문에 유의해야 합니다.
-- `Eq`에 대한 불변조건은 다음과 같습니다.
-- * `x == x`가 `True`
-- * `x == y`이면 `y == x`이고 역도 성립함
-- * `x == y`이고 `y == z`이면 `x == z`
-- * `Eq`를 구현하는 타입을 반환하는 함수 `f`에 대해 `x == y`이면 `f x == f y`
-- * `x /= y`와 `not (x == y)`는 동치
```

`Bool`이 동일성 비교가 가능함을 표현할 때는 `instance`를 만들어서 `==`를 구현하면 됩니다.

```haskell
instance Eq Bool where
    True == True   = True
	False == False = True
	_ == _         = False -- 함수 선택은 위에서 아래로 이루어지므로 위에 나열하지 않은 나머지 경우가 모두 여기에 속합니다.
    -- `/=`를 구현하지 않았으므로 위의 `class Eq a` 정의에 있는 기본 구현을 그대로 사용합니다.
```

동일성 비교가 가능한 타입만 매개변수로 받는 함수는 타입 자리에 특별한 문법으로 나타낼 수 있습니다.

```haskell
tripleEqual :: Eq a => a -> a -> a -> Bool -- `Eq a =>`는 `a`가 `Eq`를 만족해야 한다는 의미입니다.
tripleEqual a b c = a == b && b == c
```

# 이외에 글에서 언급한 문법들

## `case`..`of`식

`case`..`of`식은 함수 정의의 우변에서 패턴매칭을 하는 문법입니다.

```haskell
foo :: Maybe Integer -> Integer
foo x = case x of
    Just x' -> x'
    Nothing -> 0
```

## `do`식

`do`식을 설명하기 전에 회수해야 할 떡밥이 있습니다. 헬로 월드 프로그램을 언급하면서 뭐라고 했었죠?

> `IO ()`가 무슨 타입인지는 나중에 다시 얘기하겠습니다

### `IO`의 의미

**`IO a`는 입출력을 하고 타입 `a`의 값을 만드는 연산을 나타냅니다.** 순수 함수형 언어인 Haskell에서는 수학적인 의미의 부작용 없는 함수만 취급하기 때문에 입출력이라는 부작용을 타입 함수 `IO`로 격리합니다.

예를 들어 위에서 본 `putStrLn :: String -> IO ()`는 `String`을 받아 그 `String`을 출력하는 연산으로 만듭니다. 연산을 하고 나서 딱히 만들 만한 값이 없기 때문에 정보값이 없는[^fn-unit-type] `()`를 반환합니다.

잘 생각해 보면 `main`의 타입도 `IO ()`였는데, 즉 `main` 자체가 *입출력을 하고 종료하는 연산*이라는 의미입니다.

### `do`식으로 연산 합성하기

`do`식 안에 여러 `IO` 연산을 절차적 프로그래밍 언어에서 하던 것처럼 입력하면 그 순서대로 여러 연산을 합쳐서 하나로 만들어줍니다.

```haskell
main :: IO ()
main = do
    putStrLn "Line 1"
    putStrLn "Line 2"
    putStrLn "Line 3"
```

`IO a`가 만드는 `a` 값을 쓰고 싶다면 `<-`문을 쓸 수 있습니다.

```haskell
-- 표준 입력에서 한 줄을 입력받는 연산입니다.
getLine :: IO String

main :: IO ()
main = do
    input <- getLine
    putStrLn "Input string:"
    putStrLn input
```

`IO a`가 아닌 일반적인 `a`를 변수로 저장해두고 싶다면 `let`문을 쓸 수 있습니다.

```haskell
main :: IO ()
main = do
    let name = "EatChangmyeong"
    putStrLn name
```

`do`식도 표현식이기 때문에 `IO a` 타입을 가지고, 마지막 줄에 있는 연산의 타입을 그대로 가져옵니다. `a`를 반환하고 싶은데 `IO`가 없어서 걸리적거린다면 `pure`나 `return` 함수로 `IO a`로 만들 수 있습니다. `return`*문*이 아니라 *함수*임에 유의해 주세요.

```haskell
fiveWithoutIO :: IO Integer
fiveWithoutIO = do
    let five = 5
    pure five
```

사실 `do`식은 `IO`뿐만 아니라 타입 클래스 `Monad`를 만족하는 타입이라면 뭐든지 쓸 수 있습니다. `Monad`는 설명하기 정말 어려운 개념이기 때문에 이 글에서 구체적으로 설명하지는 않겠지만, `IO`처럼 부작용을 격리하는 방법 정도로만 이해하고 있어도 되고 혹시 관심이 있다면 그나마 읽기 좋은 한국어 자료로 [3분 모나드](https://overcurried.com/3분%20모나드/)를 추천드립니다. 원 글에서 `m ()` 같은 타입을 언급한다면 `m`이 모나드라는 뜻이고, 오류 처리 같은 걸 하겠구나라고만 생각해 주세요.

# 이외에 글에서 언급한 표준 라이브러리 함수들

```haskell
-- 환경 변수를 불러옵니다.
getEnv :: String -> IO String

-- 문자열을 특정한 문자로 잘라서 문자열의 리스트로 만듭니다.
split :: Char -> String -> [String]

-- 어떤 조건이 참일 때만 주어진 연산을 실행합니다.
-- `Applicative`는 `Monad`보다 좀 약한 것이라고만 알고 있으면 됩니다.
when :: Applicative f => Bool -> f () -> f ()

-- 리스트 (등의 자료구조)가 비어 있는지 확인합니다.
-- `Foldable`은 값을 하나씩 꺼내서 하나의 값으로 종합할 수 있는 성질을 의미하며, 리스트를 일반화합니다.
null :: Foldable t => t a -> Bool

-- 입출력 오류를 터뜨립니다.
-- `Exception`은 예외를 의미합니다.
-- 이 함수는 어차피 반환하기 전에 터지기 떄문에 `a`는 자리를 채우기 의한 의미 없는 타입 변수입니다.
throwIO :: Exception e => e -> IO a

-- 주어진 메시지를 가지는 사용자 정의 예외를 만듭니다.
-- 예외 값을 만들기만 하고, 실제로 오류를 터뜨리지는 않습니다.
userError :: String -> IOError

-- `a`를 `b`로 만드는 일반적인 함수를 `f a`를 `f b`로 만드는 함수로 만듭니다.
-- `f` = `Maybe`일 때는 `Just x`는 원래 함수처럼 연산하고 `Nothing`은 `Nothing`으로 만드는 동작을 합니다.
-- `Functor`는 `Applicative`보다 더 약한 것이라고만 알고 있으면 됩니다.
fmap :: Functor f => (a -> b) -> (f a -> f b)
```

이 정도면 글을 읽는 데 필요한 사전 지식은 전부 쓴 것 같네요. [준비 되셨나요?](/2022/12/04/parse-don-t-validate.html)

[^fn-unit-type]: 바닥 값(`undefined` 등 유효한 값으로 평가되지 않는 표현) 등의 예외적인 경우를 제외하면 단위 타입 `()`의 값은 무조건 `()`로 결정되기 때문에 "정보값이 없다"고 합니다. 실제로 단위 타입을 지원하는 `Rust`에서는 단위 타입이 0바이트를 차지합니다.