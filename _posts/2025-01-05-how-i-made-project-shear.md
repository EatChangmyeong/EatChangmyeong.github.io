---
layout: post
title: "Project::shear 어떻게 만들었는가"
tags:
- GameMaker
- 게임개발
- 선형대수학
comments: true
---

> * [셰이더를 쓸 줄 모른다. 물결 모양으로 사라지는 효과 하나 넣자고 서피스와 블렌드 모드를 남용했다.](/2021/04/29/how-i-made-honeyhouse.html)

**셰이더와 3D 렌더링을 배우면서 그래도 살만해졌습니다.** 사실 셰이더 없이 개발하면서는 서피스와 블렌드 모드만으로 할 수 있는 게 많이 없어서 `셰이더 언제 배우냐`를 연발했는데 버텍스와 프래그먼트(지오메트리는 아직도 모릅니다 🥲) 셰이더를 쓸 수 있게 되면서 그나마 제가 원하는 그래픽을 만들 수 있게 되었네요.

Honeyhouse 회고의 양식을 빌려 첫 문단을 작성했는데, Honeyhouse를 개발하고 난 뒤 2학기에 컴퓨터그래픽스를 수강하면서 OpenGL과 3D 렌더링을 배울 수 있게 되었습니다. 그 뒤로 GameMaker로 처음 개발한 3D 게임이 프로토 게임잼에 출품한 [데굴푸쉬](https://protogamejam.itch.io/degool-push)고, 이번에 공개한 [Project::shear](https://cafe.naver.com/crazygm/231904)는 두 번째입니다. Honeyhouse 회고는 날짜별로 했던 작업을 정리했는데, 이번 회고는 기술적인 난관이 많았던 만큼 구현에 필요했던 세부사항 위주로 정리해 보려고 합니다. 되도록이면 엔딩까지 보고 나서 읽어주셨으면 좋겠습니다.

> (많이 찍어놔서 다행이네요! 그럴 시간에 깃 커밋이나 해)

참고로 이번에는 깃 커밋을 했습니다.

# 시점 변환 시스템

카페 글에서 컴퓨터게임설계 팀프로젝트의 일환으로 개발한 게임이라고 썼는데, 게임의 소재 역시 같은 강의의 2주차 수업 자료에서 착안했습니다. 당시에 (미래의) 팀원들에게 보여주려고 급하게 만들었던 프로토타입이 아직 컴퓨터에 남아 있습니다.

![Project::shear의 프로토타입 화면. 검은 배경 위에 여러 개의 정사각형 블록이 카메라와 각각 거리를 두고 배치되어 있다.](/assets/post-images/project-shear-prototype.png)

사실은 이번에도 위에서 언급한 저 한 소재에 대해서 엄청나게 긴 해설을 쓰려고 합니다.

## 선형대수학을 또 하게 된 사연

Honeyhouse 회고도 [무턱대고 선형대수학 얘기부터 시작했는데](/2021/04/29/how-i-made-honeyhouse.html#무턱대고-행렬부터-만들기) 이번에도 무턱대고 선형대수학 얘기부터 시작하게 되네요.

3개의 축(위의 스크린샷에서는 우하단의 빨간색, 초록색, 파란색 화살표)으로 시점을 결정하는 현재의 시스템 역시 이때부터 기획해 두었습니다. 게임 내에서 따로 설명하지는 않았지만, 이 세 축은 아래와 같습니다.

* 카메라의 `x`편차와 `y`편차
	* 이 값이 0이 아닐 경우 카메라가 맵을 수직으로 보는 것이 아니라 편차값만큼 치우친 곳에서 비스듬하게 맵을 봅니다.
	* 렌더링은 3D이지만 게임플레이는 사실상 2D이기 때문에 (GameMaker의 기본 2D 좌표계를 따라) `x`/`z` 대신 `x`/`y`를 사용했습니다.
	* 블록의 정면 방향과 맵이 사영되는 위치를 유지하면서 카메라의 좌표를 바꾸기 위해 보통 3D 렌더링에서 쓸 일이 거의 없는 [전단변환](https://ko.wikipedia.org/wiki/전단변환행렬)을 사용했습니다. 게임 제목인 Project::**shear** 역시 여기서 유래했습니다.
* 카메라의 원근감 `persp`
	* `persp` = 0은 원근감이 아예 없는 경우, 즉 거리와 무관하게 같은 크기로 보이는 경우에 해당하며, 클수록 거리에 따른 크기 차이가 커집니다.
	* [돌리 줌](https://en.wikipedia.org/wiki/Dolly_zoom)과 같은 원리로 구현되어 있습니다. 더 자세하게는 카메라와 피사체의 거리가 $$\frac{1}{\mathrm{persp}}$$가 되도록 설정되어 있습니다.[^fn-dolly-zoom-coefficient]

한편, 3d를 지원하는 그래픽스 파이프라인이나 게임 엔진에서는 보통 아래와 같이 두 종류의 사영 행렬을 제공합니다.

* **정사영행렬**(orthographic projection matrix): 원근을 고려하지 않고 멀리 있는 것과 가까이 있는 것을 같은 크기로 투영합니다.
	* 고등학교 교육과정에서 배우는 정사영을 번역어로 사용했습니다.
* **투시사영행렬**(perspective projection matrix): 가까이 있는 것은 상대적으로 크게, 멀리 있는 것은 상대적으로 작게 투영합니다.
	* one/two/three-point perspective가 주로 '1/2/3점 투시'로 번역되는 것을 참고해 번역어를 정했습니다.

GameMaker에서는 아래와 같이 사영 행렬을 반환하는 3종류의 함수를 제공하고 있습니다.

* [`matrix_build_projection_ortho(width, height, znear, zfar)`](https://manual.gamemaker.io/monthly/en/#t=GameMaker_Language%2FGML_Reference%2FMaths_And_Numbers%2FMatrix_Functions%2Fmatrix_build_projection_ortho.htm): 정사영행렬에 해당합니다. 카메라를 기준으로 가로 `width`, 세로 `height`의 직사각기둥에서 카메라로부터의 거리가 `znear`부터 `zfar`까지인 직육면체를 잘라 사영합니다.
* [`matrix_build_projection_perspective(width, height, znear, zfar)`](https://manual.gamemaker.io/monthly/en/#t=GameMaker_Language%2FGML_Reference%2FMaths_And_Numbers%2FMatrix_Functions%2Fmatrix_build_projection_perspective.htm): 투시사영행렬에 해당합니다. 카메라의 시야를 이루는 (`znear` 기준) 가로 `width`, 세로 `height`인 직사각뿔에서 카메라로부터의 거리가 `znear`부터 `zfar`까지인 절두체[^fn-frustum]를 잘라 사영합니다.
* [`matrix_build_projection_perspective_fov(fov_y, aspect, znear, zfar)`](https://manual.gamemaker.io/monthly/en/#t=GameMaker_Language%2FGML_Reference%2FMaths_And_Numbers%2FMatrix_Functions%2Fmatrix_build_projection_perspective_fov.htm): `matrix_build_projection_perspective`와 같지만 `fov_y`(세로 방향의 시야각)와 `aspect`(종횡비)로부터 `width`와 `height`를 역산합니다.

특히 `matrix_build_projection_ortho`는 `matrix_build_projection_perspective`에서 `persp`을 0으로 보낸 특수한 경우로 볼 수 있습니다.

위에서 제공하는 함수를 사용해 맵을 렌더링하려면 0으로 나누기를 방지하기 위해 `persp`의 값을 확인해 분기해야 합니다.

{:.gml}
```javascript
// 설명의 편의를 위해...
// * `x`, `y`, `persp`이 지역 변수로 정의되어 있다고 가정합니다.
// * 맵의 중심이 (0, 0, 0)이고 가로가 `room_width`, 세로가 `room_height`인 것으로 가정합니다.

// 실제 게임에서와 같이 오른손 좌표계를 사용합니다.

// 부동소숫점 오차를 방지하기 위해 매우 작은 값 미만인지 테스트하는 방식을 사용했습니다.
if(persp < 0.000001) { // 정사영
	// 뷰 행렬
	matrix_set(
		matrix_view,
		// 카메라의 배치에서 뷰 행렬을 역산하는 함수
		matrix_build_lookat(
			x,  y, -9, // 카메라의 좌표
			0,  0,  0, // 카메라가 바라보는 좌표
			0, -1,  0  // 위 방향을 나타내는 벡터
		)
	);
	// 사영 행렬
	matrix_set(
		matrix_projection,
		matrix_build_projection_ortho(
			room_width, room_height,
			-8, 8 // 피사체 앞뒤 8단위만큼을 사영
		)
	);
} else { // 투시사영
	matrix_set(
		matrix_view,
		matrix_build_lookat(
			x,  y, -1/persp, // 0으로 나누기!!!!!
			0,  0,  0      ,
			0, -1,  0
		)
	);
	matrix_set(
		matrix_projection,
		matrix_build_projection_perspective(
			room_width, room_height,
			1/persp - 8, 1/persp + 8
		)
	)
}
```

이 정도의 코드로 만족할 수 있었겠지만, 겉보기에는 아무런 불연속점 없이 자연스럽게 이어지는 시점 변환을 나타내는 데 0으로 나누기가 생기고 그걸 우회하기 위해 분기를 사용해야 한다는 것이 내심 마음에 들지 않았습니다. 과거의 저를 조금 더 변호하자면, 이때의 사전 작업이 결국 나중의 개발에 도움이 되었고 그래픽스 파이프라인의 이해도를 더 높였다고 생각합니다.

* 렌더링에 사용하는 위의 행렬을 충돌 판정에도 똑같이 사용하기 때문에 분기로 때우는 위의 방식이 언제 문제로 이어질지 알 수 없었습니다.
* 나중에 실제로 충돌 판정을 구현할 때 부동소숫점 오차에 온 신경을 쏟았기 때문에 조금이라도 더 안정적인 수학적 모델을 구축하는 것이 중요했습니다.
* 심리적인 안정뿐만 아니라 실제 작업도 간단해지는 효과를 얻었습니다. 예를 들어, 조건부 충돌 판정을 작업할 때 행렬 모양에 따라 분기할 필요 없이 짧은 수식 하나로 넘길 수 있었습니다.

불행하게도 제가 원하는 것을 구현하려면 엔진에서 제공하는 안락한 `matrix_build_projection_*`에서 벗어나 사영 행렬을 직접 구해야 합니다.

## 렌더링의 원리

사영 행렬을 구하기 전에 우선 3D 월드가 렌더링되는 원리를 알아야 합니다. 이 게임에서 사용하는 OpenGL (ES) 파이프라인에서는 다음과 같은 원리로 그래픽을 렌더링합니다.

1. 게임 프로그래머가 **모델 공간**에서 3D 모델을 설계하고 정점 버퍼의 형태로 엔진에 입력한다.
1. 게임이 모델을 렌더링할 때가 되면 게임 코드는 원하는 셰이더에 정점 버퍼를 전달한다.
1. 셰이더는 입력된 **모델 공간**의 정점 버퍼를 **버텍스 셰이더**에 통과시켜서 **클립 공간**상의 정점을 얻는다.
	* 이 과정에는 위의 `matrix_set`에서 설정한 `matrix_*` 행렬을 적용하는 과정이 포함됩니다.
1. 위에서 얻은 **클립 공간**의 정점 중 특정 영역 안에 들어온 것만 취한 뒤 화면상에 출력될 좌표 데이터로 변환한다.
	* 클립 좌표 중 $$x$$와 $$y$$는 그대로 화면상의 좌표로 사용하고, $$z$$는 Z 버퍼링에 사용합니다. 일반적인 3D 렌더링에서는 Z 버퍼를 사용해 어떤 물체가 카메라에 더 가까운지, 즉 새로운 픽셀을 기존 픽셀 위에 그려야 하는지 아니면 버려야 하는지 판정합니다.
1. 위에서 얻은 픽셀 데이터를 **프래그먼트 셰이더**에 통과시켜서 픽셀의 색상을 얻는다.
1. 위에서 얻은 색상을 화면에 그린다.

즉, 엔진에서 제공하는 `matrix_build_projection_*` 함수를 포함해 `matrix_set`에 전달되는 행렬의 역할은 버텍스 셰이더에 전달되어 월드 공간의 좌표를 클립 공간의 좌표로 변환하는 것입니다. 이 중...
* 월드 행렬은 **모델 공간**을 **월드 공간**으로 변환하는 단계, 즉 모델로 표현된 소품을 월드에 배치하는 단계에 해당합니다.
	* 이 글의 초점은 월드 공간을 클립 공간으로 변환하는 것이므로 모델 공간과 월드 행렬은 따로 다루지 않겠습니다.
* 뷰 행렬은 **월드 공간**을 **뷰 공간**['카메라'가 원점에 있고 (GameMaker 기준) 양의 $$z$$축 방향을 바라보는 좌표계]으로 변환하는 단계, 즉 임의로 정해져 있는 월드 좌표계를 '카메라'의 관점으로 변환하는 단계에 해당합니다.
* 사영 행렬은 **뷰 공간**을 **클립 공간**으로 변환하는 단계, 즉 카메라가 비추는 실제 장면을 '필름'에 사영하는 단계에 해당합니다.

그런데 사실 '카메라'는 렌더링 파이프라인의 이해를 돕기 위한 비유일 뿐 실제로 월드 내에 물리적인 카메라를 만들어서 렌더링을 하는 것은 아니기 때문에 실질적으로 제가 손댈 수 있는 것은 **뷰 행렬**과 **사영 행렬** 두 가지입니다. 어차피 월드-뷰-사영 행렬을 모두 곱해서 결과가 같으면 렌더링한 결과는 같으니까요.

## GameMaker와 OpenGL의 좌표계

3D 렌더링의 원리를 이해했으니 이제 변환의 대상과 결과물인 월드 공간과 클립 공간을 알아야 합니다. 우선 위에서 잠깐 다뤘듯이 GameMaker에서 사용하는 2D 좌표계는 다음과 같습니다.

* 룸의 왼쪽 위가 원점
* $$x$$축은 오른쪽
* $$y$$축은 아래쪽
* 내장 인스턴스 변수 `depth`를 사용해 인스턴스가 그려지는 순서를 조절할 수 있으며, 클수록 '깊은' 곳에 그려지고 `depth`가 작은 인스턴스에 묻힙니다. 이 변수가 실질적인 '제3의 축' 역할을 합니다.

Project::shear에서도 이 설정을 존중해 다음과 같이 월드 좌표계를 구성했습니다.

* 맵의 왼쪽 위가 원점
* $$x$$축은 오른쪽
* $$y$$축은 아래쪽
* $$z$$축은 카메라에서 먼 쪽
* 피사체는 $$z$$ = 0에 위치

마지막으로, 클립 공간에서 렌더링에 사용하는 범위는 $$-1 \le x \le 1$$, $$-1 \le y \le 1$$, $$0 \le z \le 1$$이며, 카메라에 가까울수록 $$z$$가 작습니다.[^fn-opengl-es-platform] 이제 알아야 하는 좌표계는 모두 구했습니다.

## 3차원 세계, 4차원 행렬

하지만 본격적으로 사영 행렬을 구하기 전에 알아야 할 것이 또 하나 남았습니다(진짜 마지막입니다. 약속드립니다). 3차원 월드의 렌더링을 다루는 데는 3차원 행렬이 아니라 **4차원** 행렬이 필요합니다.

아주 기본적인 3차원 좌표계의 변환은 3차원 벡터와 3차원(3×3) 행렬만 있으면 되는 게 맞습니다. 다만 3차원 행렬은 **원점에 변환을 가할 수 없다**는 치명적인 한계가 있습니다. 아래 행렬의 $$a$$부터 $$i$$까지에 무엇을 대입하든 원점의 변환 결과는 그대로 원점입니다.

$$
\begin{pmatrix}
	a & b & c \\
	d & e & f \\
	g & h & i
\end{pmatrix}
\begin{pmatrix}
	0 \\
	0 \\
	0
\end{pmatrix}
=
\begin{pmatrix}
	0a + 0b + 0c \\
	0d + 0e + 0f \\
	0g + 0h + 0i
\end{pmatrix}
=
\begin{pmatrix}
	0 \\
	0 \\
	0
\end{pmatrix}
$$

원점에 변환을 가하려면 행렬로써 $$f(x, y, z) = ax + by + cz + \boldsymbol{d}$$를 표현할 수 있어야 하는데, 그 대신 $$f'(x, y, z, \boldsymbol{w}) = ax + by + cz + \boldsymbol{dw}$$를 표현하는 4차원(4×4) 행렬을 만들고 $$w$$를 항상 1인 것으로 취급하는(!) 수학적 '꼼수'를 사용하면 됩니다.

$$
\begin{pmatrix}
	a & b & c & j \\
	d & e & f & k \\
	g & h & i & l \\
	0 & 0 & 0 & 1
\end{pmatrix}
\begin{pmatrix}
	0 \\
	0 \\
	0 \\
	1
\end{pmatrix}
=
\begin{pmatrix}
	0a + 0b + 0c + 1j \\
	0d + 0e + 0f + 1k \\
	0g + 0h + 0i + 1l \\
	0 \cdot 0 + 0 \cdot 0 + 0 \cdot 0 + 1 \cdot 1
\end{pmatrix}
=
\begin{pmatrix}
	j \\
	k \\
	l \\
	1
\end{pmatrix}
$$

*그래도* 아직 한 가지 문제가 더 남아 있습니다. 절두체를 직육면체로 변환하려면 나눗셈이 필요한데(절두체의 단면 중 너비가 $$a$$인 것을 너비가 1인 단면으로 바꾸려면 좌표에 $$\frac{1}{a}$$을 곱해야 합니다), 행렬로는 **나눗셈을 표현할 수 없습니다.**

선형대수학으로 3D 렌더링까지 할 수 있으려면 한 가지 꼼수가 더 필요합니다. 아까 벡터에 억지로 집어넣은 $$w$$ = 1이 보이시나요? $$w$$가 1이 아니면 어떻게 될까요? **그냥 *나눠서* 1로 만들면 되는 거 아님??**

변환한 벡터의 $$w$$좌표가 절두체 단면의 너비(의 상수배)가 되도록 사영 행렬을 구성하면 OpenGL이 **투시 나눗셈**(perspective division)이라는 과정을 거쳐 절두체를 깔끔한 직육면체로 만들어 줍니다. 다행히 절두체 단면의 너비는 선형적으로 증가하므로 행렬로 표현할 수 있습니다. 특히 절두체의 모서리를 연장하면 카메라가 있는 평면에서 단면의 너비가 0이 되므로 카메라의 좌표를 버텍스 셰이더에 넣으면 변환된 $$w$$좌표는 0이 됩니다. (나중에 이 성질을 활용할 예정입니다.)

참고로 여기서 '꼼수'라고 표현한 테크닉을 수학계에서는 [동차좌표](https://ko.wikipedia.org/wiki/동차좌표)라고 합니다.

## 사영행렬 구성하기

위에서 언급한 3개의 시점 축 $$\Delta x$$, $$\Delta y$$, $$p$$(`ersp`)와 맵의 크기 $$w$$(idth), $$h$$(eight), 절두체 단면의 거리 $$n$$(ear), $$f$$(ar)까지 총 7개의 변수를 가지고 월드 좌표계를 클립 좌표계로 변환하는 행렬을 구성해 봅시다. 단...

* $$\Delta x$$와 $$\Delta y$$는 플레이어 방향으로 돌출된(즉, **음의** $$z$$좌표를 가지는) 물체가 오른쪽 아래로 튀어나와 보이는 방향이 양인 것으로 정의합니다.
* $$n$$과 $$f$$는 카메라에서 단면까지의 거리가 아니라 **피사체에서** 단면까지의 **부호 있는** 거리이며, 카메라에서 먼 쪽이 양입니다.
	* 기존의 '카메라 지향' 사영 행렬을 사용하면 카메라의 좌표에서 0으로 나누기가 발생하기 때문에 시점이 바뀌어도 같은 곳에 있는 '피사체 지향' 방법을 사용합니다.

$$\boldsymbol{M}$$

한 번에 행렬을 구성하기는 부담스러우니 작은 단계로 쪼개봅시다.

1. 맵은 $$0 \le x \le w$$, $$0 \le y \le h$$의 공간을 차지하므로 원점을 옮겨 중심을 맞춘다.
1. $$\Delta x$$와 $$\Delta y$$를 사용해 전단변환을 수행한다.
1. 변환된 월드를 클립 공간에 사영한다.

$$\boldsymbol{M} = \boldsymbol{P}\boldsymbol{S}\boldsymbol{O}$$

(참고로 행렬 변환은 오른쪽에서 왼쪽으로 이루어집니다.)

원점을 옮기는 행렬 $$\boldsymbol{O}$$(rigin)와 전단변환을 수행하는 행렬 $$\boldsymbol{S}$$(hear)는 쉽게 구성할 수 있습니다.

$$
\boldsymbol{O}
=
\begin{pmatrix}
	1 & 0 & 0 & -\frac{w}{2} \\
	0 & 1 & 0 & -\frac{h}{2} \\
	0 & 0 & 1 & 0 \\
	0 & 0 & 0 & 1
\end{pmatrix}
$$

$$
\boldsymbol{S}
=
\begin{pmatrix}
	1 & 0 & -\Delta x & 0 \\
	0 & 1 & -\Delta y & 0 \\
	0 & 0 & 1 & 0 \\
	0 & 0 & 0 & 1
\end{pmatrix}
$$

$$\Delta x$$와 $$\Delta y$$에 음의 부호가 있음에 유의해 주세요.

$$\boldsymbol{P}$$(rojection) 역시 더 작은 단계로 쪼개봅시다.

1. 월드 좌표계를 뷰 좌표계로 변환한다. **단, 카메라가 아닌 피사체가 원점에 온다.**
1. 변환된 뷰를 클립 공간에 사영한다.

$$\boldsymbol{P} = \boldsymbol{C}\boldsymbol{V}$$

사실 위에서 맵의 중심을 이미 맞췄고 피사체는 `z` = 0에 있는 것으로 정의했기 때문에 $$\boldsymbol{V}$$(iew)는 그냥 단위행렬이 됩니다.

$$
\boldsymbol{V} = \boldsymbol{I}
=
\begin{pmatrix}
	1 & 0 & 0 & 0 \\
	0 & 1 & 0 & 0 \\
	0 & 0 & 1 & 0 \\
	0 & 0 & 0 & 1
\end{pmatrix}
$$

$$\boldsymbol{C}$$(lip)가 제일 구성하기 어려운 행렬입니다.

$$
\boldsymbol{C}
=
\begin{pmatrix}
	C_{11} & C_{12} & C_{13} & C_{14} \\
	C_{21} & C_{22} & C_{23} & C_{24} \\
	C_{31} & C_{32} & C_{33} & C_{34} \\
	C_{41} & C_{42} & C_{43} & C_{44}
\end{pmatrix}
$$

그런데 생각해보면 뷰 좌표를 클립 좌표로 변환할 때는 $$x$$, $$y$$, $$z$$ 사이에 뚜렷한 상호작용이 없는 것을 알 수 있습니다. $$z$$가 변함에 따라 클립 좌표의 $$x$$와 $$y$$가 바뀌긴 하지만 그건 투시 나눗셈으로 처리해야 하니 $$z$$가 아니라 $$w$$에 의존하는 것으로 생각할 수 있습니다.

* $$x$$와 $$y$$좌표는 각각 독립적으로 클립 좌표계에 맞추어집니다.
* $$z$$좌표는 투시 나눗셈에 간접적으로 활용되면서 동시에 near/far 평면을 $$\frac{z}{w}$$ = 0과 $$\frac{z}{w}$$ = 1에 맞추는 역할을 합니다.

이 사실을 바탕으로 $$\boldsymbol{C}$$에서 $$x$$와 $$y$$와 $$z$$/$$w$$가 상호작용하는 항을 없애면 이렇게 됩니다. 미지수가 16개에서 6개로 줄었네요!

$$
\boldsymbol{C}
=
\begin{pmatrix}
	C_{11} & 0 & 0 & 0 \\
	0 & C_{22} & 0 & 0 \\
	0 & 0 & C_{33} & C_{34} \\
	0 & 0 & C_{43} & C_{44}
\end{pmatrix}
$$

우선 $$\boldsymbol{C}$$의 우하단을 구해 봅시다. 구하고자 하는 행렬로 (?, ?, $$z$$)를 변환하면 다음 성질이 성립해야 합니다.

* **near 평면의 변환**: 변환 전에 $$z$$ = $$n$$이면 변환된 $$\frac{z}{w}$$ = 0, 즉 $$z$$ = 0
* **far 평면의 변환**: 변환 전에 $$z$$ = $$f$$이면 변환된 $$\frac{z}{w}$$ = 1, 즉 $$z$$ = $$w$$
* **카메라의 좌표 성질**: 변환 전에 $$z$$ = $$-\frac{1}{p}$$이면 변환된 $$w$$ = 0

위의 세 성질을 행렬 변환으로 나타내면 다음과 같습니다. 편의상 우하단 2×2 부분만 작성합니다.

$$
\begin{pmatrix}
	C_{33} & C_{34} \\
	C_{43} & C_{44}
\end{pmatrix}
\begin{pmatrix}
	n \\
	1
\end{pmatrix}
=
\begin{pmatrix}
	C_{33}n + C_{34} \\
	C_{43}n + C_{44}
\end{pmatrix} \\
\therefore C_{33}n + C_{34} = 0
$$

$$
\begin{pmatrix}
	C_{33} & C_{34} \\
	C_{43} & C_{44}
\end{pmatrix}
\begin{pmatrix}
	f \\
	1
\end{pmatrix}
=
\begin{pmatrix}
	C_{33}f + C_{34} \\
	C_{43}f + C_{44}
\end{pmatrix} \\
\therefore C_{33}f + C_{34} = C_{43}f + C_{44}
$$

$$
\begin{pmatrix}
	C_{33} & C_{34} \\
	C_{43} & C_{44}
\end{pmatrix}
\begin{pmatrix}
	-\frac{1}{p} \\
	1
\end{pmatrix}
=
\begin{pmatrix}
	-\frac{C_{33}}{p} + C_{34} \\
	-\frac{C_{43}}{p} + C_{44}
\end{pmatrix} \\
\therefore C_{44}p - C_{43} = 0
$$

연립방정식을 푼 결과는 다음과 같습니다.

$$
C_{33} = \frac{1 + pf}{f - n}C_{44} \\
C_{34} = -n\frac{1 + pf}{f - n}C_{44} \\
C_{43} = pC_{44}
$$

등식이 3개였으므로 미지수 중 하나는 결정할 수 없지만, 어차피 투시 나눗셈을 하면 상쇄되므로 편의상 $$C_{44}$$ = 1로 정하겠습니다.

$$
\boldsymbol{C}
=
\begin{pmatrix}
	C_{11} & 0 & 0 & 0 \\
	0 & C_{22} & 0 & 0 \\
	0 & 0 & a & -na \\
	0 & 0 & p & 1
\end{pmatrix} \;
\mathrm{where} \; a = \frac{1 + pf}{f - n}
$$

이제 마지막으로 $$z$$ = 0인 경우의 좌표 하나를 대입하면 $$\boldsymbol{C}$$를 완전히 결정할 수 있습니다.

$$
\begin{pmatrix}
	C_{11} & 0 & 0 & 0 \\
	0 & C_{22} & 0 & 0 \\
	0 & 0 & a & -na \\
	0 & 0 & p & 1
\end{pmatrix}
\begin{pmatrix}
	\frac{w}{2} \\
	\frac{h}{2} \\
	0 \\
	1
\end{pmatrix}
=
\begin{pmatrix}
	\frac{w}{2}C_{11} \\
	\frac{h}{2}C_{22} \\
	-na \\
	1
\end{pmatrix}
\sim (1, 1, ?) \\
\therefore C_{11} = \frac{2}{w}, C_{22} = \frac{2}{h}
$$

완성된 $$\boldsymbol{C}$$는 다음과 같고...

$$
\boldsymbol{C}
=
\begin{pmatrix}
	\frac{2}{w} & 0 & 0 & 0 \\
	0 & \frac{2}{h} & 0 & 0 \\
	0 & 0 & a & -na \\
	0 & 0 & p & 1
\end{pmatrix}
$$

완성된 $$\boldsymbol{M}$$은 다음과 같습니다. 🎉

$$
\boldsymbol{M} = \boldsymbol{C}\boldsymbol{S}\boldsymbol{O}
=
\begin{pmatrix}
	\frac{2}{w} & 0 & 0 & 0 \\
	0 & \frac{2}{h} & 0 & 0 \\
	0 & 0 & a & -na \\
	0 & 0 & p & 1
\end{pmatrix}
\begin{pmatrix}
	1 & 0 & -\Delta x & 0 \\
	0 & 1 & -\Delta y & 0 \\
	0 & 0 & 1 & 0 \\
	0 & 0 & 0 & 1
\end{pmatrix}
\begin{pmatrix}
	1 & 0 & 0 & -\frac{w}{2} \\
	0 & 1 & 0 & -\frac{h}{2} \\
	0 & 0 & 1 & 0 \\
	0 & 0 & 0 & 1
\end{pmatrix}
$$

저는 여기서 $$\boldsymbol{S}\boldsymbol{O}$$에 해당하는 아래 행렬을 뷰 행렬로 사용했고...

$$
\begin{pmatrix}
	1 & 0 & -\Delta x & -\frac{w}{2} \\
	0 & 1 & -\Delta y & -\frac{h}{2} \\
	0 & 0 & 1 & 0 \\
	0 & 0 & 0 & 1
\end{pmatrix}
$$

나머지 $$\boldsymbol{C}$$를 그대로 사영 행렬로 사용했습니다.

# 충돌 판정

[위키백과](https://en.wikipedia.org/wiki/Collision_detection#A_posteriori_(discrete)_versus_a_priori_(continuous))에서는 충돌 처리의 두 가지 방법론으로 사후 (이산) 처리와 사전 (연속) 처리를 들고 있습니다.

* **사후**(a posteriori) 처리는 일단 물체를 움직인 후 겹치는 물체가 생기면 충돌한 것으로 간주해 적절한 처리를 하는 방식입니다. 절대 다수의 게임에서 이 방식을 사용하고 있습니다.
* **사전**(a priori) 처리는 모든 물체의 궤적을 사전에 계산한 뒤 두 물체의 궤적 사이에 교점이 생기는 정확한 시점을 예측해 적절한 처리를 하는 방식입니다. 현실에서 물체가 충돌하는 방식과 더 비슷합니다.

프로젝트를 막 시작했을 때는 모든 충돌 판정을 사전 처리로 구현하려고 했는데...

$$
\begin{align}
\boldsymbol{C}(t)\boldsymbol{S}(t)\boldsymbol{O}(t)
&=
\begin{pmatrix}
	\frac{2}{w} & 0 & -2\frac{\Delta x(t)}{w} & -1 \\
	0 & \frac{2}{h} & -2\frac{\Delta y(t)}{h} & -1 \\
	0 & 0 & \frac{1 + p(t)f(t)}{f(t) - n(t)} & -n(t)\frac{1 + p(t)f(t)}{f(t) - n(t)} \\
	0 & 0 & p(t) & 1
\end{pmatrix} \\
&=
\begin{pmatrix}
	\frac{2}{w} & 0 & -2\frac{\Delta x_1t + \Delta x_0}{w} & -1 \\
	0 & \frac{2}{h} & -2\frac{\Delta y_1t + \Delta y_0}{h} & -1 \\
	0 & 0 & \frac{1 + (p_1t + p_0)(f_1t + f_0)}{(f_1t + f_0) - (n_1t + n_0)} & -(n_1t + n_0)\frac{1 + (p_1t + p_0)(f_1t + f_0)}{(f_1t + f_0) - (n_1t + n_0)} \\
	0 & 0 & p_1t + p_0 & 1
\end{pmatrix}
\end{align}
$$

$$M_{34} = -(n_1t + n_0)\frac{1 + (p_1t + p_0)(f_1t + f_0)}{(f_1t + f_0) - (n_1t + n_0)}$$이 보이시나요? 시점에 따라 바뀌는 궤적을 정확히 추적하려면 분모에서 1차 + 분자에서 3차, 총 **사차방정식**을 풀어야 합니다. [사차방정식의 근의 공식](https://commons.wikimedia.org/wiki/File:Quartic_Formula.svg)을 살펴봅시다.

![사차방정식의 근의 공식](/assets/post-images/quartic-formula.png)

그냥 시점이 바뀔 때는 사후 처리를 하기로 했습니다. 플랫포밍은 원래 기획대로 사전 처리했습니다.

## 변환을 거친 맵 요소의 표현

플레이어와 맵 요소 사이의 충돌을 판정하려면 먼저 변환을 거친 맵 요소를 충돌 판정을 할 수 있는 형식으로 표현해야 합니다. 여러 가지 방법을 구상하다가 직육면체를 사영하면 외곽선을 4~6개의 선분으로 표현할 수 있는 것을 기억해내고 방향이 있는 선분을 시계 방향으로 배치해서 충돌 범위를 표현했습니다.

![게임 내의 블록 한 칸이 사영된 외곽선이 여섯 개의 선분으로 표현되어 있다.](/assets/post-images/projected-block-border.png)

충돌 판정을 편하게 하기 위해 [민코프스키 차](https://en.wikipedia.org/wiki/Minkowski_addition)를 구하고 4~6개의 선분을 기준으로 얼마나 깊이 묻혀있는지 계산해서 모두 양수이면 충돌한 것으로, 하나라도 음수이면 충돌하지 않은 것으로 판단합니다. 이 방법에는 어느 방향으로 얼마나 움직이면 충돌이 해결되는지도 바로 알 수 있다는 장점이 있습니다.

## 단방향 경계면의 충돌 판정

Project::shear에서는 앞면이 보일 때만 충돌 판정에 참여하는 맵 요소를 찾아볼 수 있습니다. 인게임에서 충분히 드러나지 못한 것 같아 아쉬웠던 점 중 하나입니다.

![Project::shear의 스테이지 5](/assets/post-images/project-shear-stage-5.png)

이 판정 역시 아까 구한 사영 행렬에서 유도했는데, 예를 들어 위 스크린샷에 있는 왼쪽 경계면은 $$z$$가 커질수록 사영되는 점이 왼쪽으로 갈 때만(즉, 앞면이 보일 때만) 충돌 판정을 활성화하는 방식으로 구현했습니다. 참고로 $$(x, y, z)$$의 변환을 닫힌 형태로 구하면 이렇습니다.

$$
\begin{align}
\boldsymbol{C}\boldsymbol{S}\boldsymbol{O}
\begin{pmatrix}
	x \\
	y \\
	z \\
	1
\end{pmatrix}
&=
\begin{pmatrix}
	\frac{2}{w} & 0 & -2\frac{\Delta x}{w} & -1 \\
	0 & \frac{2}{h} & -2\frac{\Delta y}{h} & -1 \\
	0 & 0 & \frac{1 + pf}{f - n} & -n\frac{1 + pf}{f - n} \\
	0 & 0 & p & 1
\end{pmatrix}
\begin{pmatrix}
	x \\
	y \\
	z \\
	1
\end{pmatrix} \\
&=
\begin{pmatrix}
	2\frac{x - z\Delta x}{w} - 1 \\
	2\frac{y - z\Delta y}{h} - 1 \\
	(z - n)\frac{1 + pf}{f - n} \\
	zp + 1
\end{pmatrix} \\
&\sim
(\frac{2x - 2z \Delta x - w}{w(zp + 1)}, \frac{2y - 2z \Delta y - h}{h(zp + 1)}, \frac{(z - n)(1 + pf)}{(zp + 1)(f - n)})
\end{align}
$$

여기서 $$x$$좌표를 $$z$$에 대해 미분하고 정리하면 $$2xp > wp - 2 \Delta x$$까지 간단해집니다. 오른쪽, 위쪽, 아래쪽 경계면도 $$x$$, $$\Delta x$$, $$w$$를 $$y$$, $$\Delta y$$, $$h$$로 바꾸거나 부등호의 방향만 바꿔서 구현했습니다.

## 수치 안정성

플랫포밍을 처음 구현했을 때는 특정한 조작을 하면 블록 사이로 빠지는 버그가 있었습니다. (참고로 일부 블록이 깜박이는 것은 충돌 판정입니다.)

<p>
<video muted controls poster="/assets/post-images/project-shear-nov24-thumbnail.png">
<source type="video/webm" src="/assets/post-images/project-shear-nov24.webm">
</video>
</p>

'특정한 조작'을 디버깅할 때마다 다시 입력하는 것이 귀찮아서 자세히 파보지는 않았지만, 부동소숫점 특유의 수치 안정성 문제라고 생각하고 충돌 판정 시 $$\frac{1}{256}$$블록만큼의 완충 지대를 두어 해결했습니다. 이외에도 이동 처리 중에 무한루프에 빠지는 등의 문제가 있었는데, 열심히 디버그를 해서 어느 시점 이후에는 더 이상 문제가 발생하지 않았습니다.

# 스테이지 8을 보셨나요?

![Project::shear의 스테이지 8. 플레이어 모델이 카메라의 시야 방향으로 늘어나 있다.](/assets/post-images/project-shear-stage-8.png)

**서프라이즈!!!!!** 당연히 충돌 판정이 이런 식으로 구현된 건 아니고, 게임의 충돌 판정에 그럴듯한 '세계관 내' 설명을 붙이고 동시에 페이크 3D 게임이 아니라는 것을 어필하려는 결과였습니다. (3D 게임에 가산점이 부여된다는 공지가 있었습니다.)

이 게임의 모든 모델은 별도의 외부 파일 없이 게임 내에서 절차적으로 구성했는데, 플레이어 모델은 `persp`에 따라 *비선형으로* 바뀌기 때문에 매번 정점 버퍼를 다시 만들어줘야 했습니다. 지금 생각해보면 행렬을 어떻게 잘 만들어서 모델 하나를 돌려쓸 수 있었을 것 같은데 실제로 가능할지는 잘 모르겠네요.

참고로 8스테이지에 나온 플레이어 모델은 사실 1스테이지부터 계속 쓰고 있었습니다.

# 결론

드디어 기억나는 내용을 전부 썼네요!

허니하우스에서 배웠던 [기획은 작게 잡으라는](/2021/04/29/how-i-made-honeyhouse.html#결론) 교훈을 잊어버리고 또 커다란 기획을 세웠다가 제가 다 구현해야 한다는 현실의 벽에 부딪혔습니다. 그나마 4명이 조를 짜서 작업해서 그런지 조금 서두르긴 했지만 마감을 못 맞추는 사태는 피했습니다. 아마 이 글의 링크를 작업용 디스코드 서버에도 올릴 텐데 이 자리를 빌려 감사의 말씀을 전하고 싶습니다.

이번 글은 이 정도로 마칠까 합니다. 재밌게 읽으셨길 바라요 🙇‍♂️

[^fn-dolly-zoom-coefficient]: 실제 게임에서는 자주 사용하는 범위가 0 이상 1 이하에 대응하도록 `persp`에 상수를 곱하지만, 이 글에서는 무시하겠습니다.
[^fn-frustum]: Frustum. 주로 각뿔이나 원뿔을 평행한 두 평면으로 자른 도형. 특히 3D 렌더링에서는 카메라의 직사각뿔 모양 시야를 near 평면과 far 평면으로 자른 도형을 말한다.
[^fn-opengl-es-platform]: 최소한 제가 개발에 사용한 Windows 11, x86-64 환경에서는 글에 적은 것과 같이 동작하지만 다른 환경에서도 똑같이 동작할지는 잘 모르겠습니다. 혹시 그래픽이 깨지면 알려주세요.