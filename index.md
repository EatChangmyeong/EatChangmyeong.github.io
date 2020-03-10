---
layout: front
---

# 첫 화면

공사 중! CSS 거의 다 넣었다
* [ ] 체크박스
* [ ] 문법 하이라이팅
* [ ] 테이블

이 아래는 [Creta5164/GFM and Plugins test.md](https://gist.github.com/Creta5164/390dda69a94ccb9ca49b2a85258d2597#file-gfm-and-plugins-test-md)에서 안 되는 거 빼고 h3~h5 추가한 거예요

# Github Flavored Markdown (GFM)

## 헤더

# This is an `<h1>` tag
## This is an `<h2>` tag
### This is an `<h3>` tag
#### This is an `<h4>` tag
##### This is an `<h5>` tag
###### This is an `<h6>` tag

## 문법

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

**This is bold text**
__This is bold text__

*This is italic text*
_This is italic text_

(like ~~this~~)
~~Strikethrough~~

## 목록

* Item 1 unordered list `* + SPACE`
* Item 2
    * Item 2a unordered list `TAB + * + SPACE`
    * Item 2b

## 목록 순서

1. Item 1 ordered list `Number + . + SPACE`
2. Item 2 
3. Item 3
    1. Item 3a ordered list `TAB + Number + . + SPACE`
    2. Item 3b

## 할 일 목록

- [ ] task one not finish `- + SPACE + [ ]`
- [x] task two finished `- + SPACE + [x]`

## 사진

![GitHub set up](https://help.github.com/assets/images/site/set-up-git.gif)
Format: ![Alt Text](url)

## 주소

email <example@example.com>
[GitHub](http://github.com)
autolink  <http://www.github.com/>

[link text](http://dev.nodeca.com)
[link with title](http://nodeca.github.io/pica/demo/ "title text!")

## 인용문

As Kanye West said:
> We're living the future so
> the present is our past.

## 코드 (단일)

I think you should use an
`<addr>` `code` element here instead.

## 코드 (여러줄)

```js
function fancyAlert(arg) {
  if(arg) {
    $.facebox({div:'#foo'})
  }
}
```

## 테이블

First Header | Second Header
------------ | -------------
Content from cell 1 | Content from cell 2
Content in the first column | Content in the second column

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

## 가로선

***

*****

- - -

## 꼬리말

Footnote 1 link[^first].
Footnote 2 link[^second].

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**
    and multiple paragraphs.

[^second]: Footnote text.

# 확장 기능

## 정의 리스트

Term 1

:   Definition 1
with lazy continuation.

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

_Compact style:_

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b