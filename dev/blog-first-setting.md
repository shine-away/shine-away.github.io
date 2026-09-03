# shine.away.log 초기 구축 기록

작성: 2026-09-03

이 문서는 블로그 초기 구축 작업의 결과와 판단 근거를 남긴 것이다. 다음 작업자가
코드를 다시 뜯어보지 않고도 이어서 작업할 수 있도록, "무엇을 했는지"보다 "왜 그렇게
했는지"와 "건드리면 깨지는 지점"에 무게를 뒀다.

## 현재 상태

- 커밋: `9791698` — `feat: add MDX blog with tags, RSS, sitemap, and OG images`
- 브랜치: `main` (origin/main보다 1커밋 앞섬, **아직 push하지 않음**)
- push하면 GitHub Actions가 lint → test → build → GitHub Pages 배포까지 자동 수행
- 배포 URL: https://shine-away.github.io/ (리포: `shine-away/shine-away.github.io`)
- 로컬 검증 상태: 테스트 30개 통과, lint 에러 없음, 빌드 성공, `npm audit` 0건

즉, **다음 액션은 push 여부 결정**이다. 배포 전에 더 손볼 게 있으면 먼저 작업하면 된다.

## 스택

| 항목 | 버전/선택 | 비고 |
| --- | --- | --- |
| Next.js | 16.3.3 (App Router, Turbopack) | `output: "export"` 정적 export |
| React | 19.2.8 | |
| MDX | `@next/mdx` 16.3.3 | `.md`/`.mdx` 모두 컴파일 |
| 프론트매터 | `gray-matter` 4.0.3 | |
| 마크다운 확장 | `remark-gfm` 4.0.1 | |
| 코드 하이라이트 | `rehype-pretty-code` 0.14.1 (shiki) | dual theme |
| 스타일 | Tailwind v4 + `@tailwindcss/typography` 0.5.16 | |
| 다크모드 | `next-themes` 0.4.6 | class 전략 |
| 테스트 | vitest 3.2.7 | 3.2.6 미만은 critical 취약점 있음 |

의존성은 새로 추가한 것들을 **정확한 버전으로 고정**했다(캐럿 없음). create-next-app이
넣어준 기존 devDependencies(`tailwindcss: ^4` 등)는 불필요한 변경을 피하려고 그대로 뒀다.

로컬 Node는 v25.4.0, CI는 `actions/setup-node` node-version "20". `next.config.ts`와
`vitest.config.mts`에서 `import.meta.dirname`을 쓰므로 **Node 20.11 이상 필요**하다.

### tailwind-nextjs-starter-blog를 fork하지 않은 이유

당초 요구는 "starter-blog를 fork해서 기능을 가져오고 Vercel Portfolio처럼 UI를 덜어내기"
였다. 그런데 그 프로젝트는 contentlayer/pliny 계열 의존성과 서버 기능을 쓰기 때문에
`output: "export"`(GitHub Pages 정적 배포)와 충돌한다. 그래서 **기능 목록만 참고하고**
Next 16 공식 방식(`@next/mdx` + `gray-matter` + `fs`)으로 재구성했다. Vercel의 Portfolio
Starter Kit이 정확히 이 스택이다.

## 디렉토리 구조와 역할

```
content/posts/*.mdx        글 원본 (프론트매터 + 본문)
mdx-components.tsx         MDX 전역 컴포넌트 매핑 (프로젝트 루트여야 함)
next.config.ts             static export + MDX 플러그인 + turbopack.root
vitest.config.mts          @ alias, node 환경, src/**/*.test.ts
src/lib/
  posts.ts                 콘텐츠 읽기 + 순수 로직(파싱/정렬/태그집계/중복검사)
  slug.ts                  URL-safe slug 생성
  date.ts                  표시용 날짜 포맷 + RSS용 RFC 822 변환
  site.ts                  사이트 제목/설명/URL/내비 설정
  og.tsx                   OG 카드 렌더러 (ImageResponse)
  *.test.ts                순수 로직 단위 테스트 30개
src/components/
  header.tsx               서버 컴포넌트
  nav-links.tsx            클라이언트: usePathname으로 aria-current
  theme-toggle.tsx         클라이언트: 다크모드 토글
  providers.tsx            next-themes ThemeProvider
  post-list.tsx            글 목록 (headingLevel prop)
  footer.tsx               빌드 시점 연도 + RSS 링크
src/app/
  layout.tsx               metadataBase, OG/Twitter, 폰트, 헤더/푸터
  page.tsx                 홈 (소개 + 최근 5개)
  blog/page.tsx            전체 목록
  blog/[slug]/page.tsx     글 상세 (MDX 동적 import)
  tags/[tag]/page.tsx      태그별 목록
  rss.xml/route.ts         RSS 피드
  sitemap.ts, robots.ts    sitemap.xml, robots.txt
  og/image.png/route.ts               사이트 기본 OG 이미지
  og/blog/[slug]/image.png/route.ts   글별 OG 이미지
  globals.css              Tailwind + typography + shiki 색상 매핑
```

생성되는 라우트(전부 정적):
`/`, `/blog`, `/blog/[slug]`, `/tags/[tag]`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`,
`/og/image.png`, `/og/blog/[slug]/image.png`

## 글 쓰는 방법

`content/posts/`에 `.mdx`(또는 `.md`) 파일을 추가하면 끝이다.

```md
---
title: "글 제목"
date: "2026-09-02"
summary: "목록과 메타 설명에 쓰이는 한 줄 요약"
tags: ["meta", "nextjs"]
---

본문. MDX이므로 React 컴포넌트도 쓸 수 있다.
```

- 파일명이 URL slug가 된다. 단 `slugify`를 통과하므로 `My Post.mdx` → `/blog/my-post/`.
- `date`는 따옴표를 써도 되고 안 써도 된다. 따옴표가 없으면 YAML이 Date 객체로 파싱하는데,
  `normalizeDate`가 이를 UTC 기준 날짜 문자열(`YYYY-MM-DD`)로 정규화한다. 시간이 붙은
  타임스탬프도 날짜 부분만 남는다.
- 태그도 문자열로 쓰는 게 좋다. 숫자를 넣어도 문자열로 강제 변환되지만 의도를 드러내는
  편이 낫다.
- 서로 다른 파일이 같은 slug로 정규화되면 **빌드가 명확한 에러로 실패**한다(의도된 동작).

## 설계 결정과 함정

여기가 이 문서의 핵심이다. 아래 항목들은 모두 실제로 깨져서 고친 것이거나, 검증을
통해 판단을 바꾼 것이다. 무심코 "정리"하면 재발한다.

### 1. OG 이미지는 `opengraph-image` 관례를 쓰지 않는다

Next 관례(`opengraph-image.tsx`)로 만들면 `output: export`에서 **확장자 없는 파일**
(`out/opengraph-image`)로 나온다. 정적 서버는 이 파일에 Content-Type을 붙이지 않고
(같은 서버에서 `rss.xml`은 `application/xml`이 붙었다), 그러면 OG 스크래퍼가 이미지로
인식하지 않는다.

그래서 `rss.xml`이 정상 동작한 방식을 따라 **`.png` 리터럴 세그먼트를 가진 라우트
핸들러**로 만들었다: `src/app/og/image.png/route.ts`, `src/app/og/blog/[slug]/image.png/route.ts`.
`Content-Type: image/png`로 서빙되는 것을 확인했다. `openGraph.images`는 layout과 글
페이지에서 명시적으로 지정한다.

`opengraph-image.tsx`로 "표준화"하려는 시도는 조용한 회귀다.

### 2. globals.css의 코드블록 규칙은 의도적으로 unlayered다

Tailwind v4에서 typography 플러그인 스타일은 `@layer utilities` 안에 들어가고, layer가
없는 선언은 **특이도와 무관하게 layer 안의 모든 규칙을 이긴다**. globals.css의
`[data-rehype-pretty-code-figure] pre` 등이 prose 기본 `pre` 스타일을 덮는 근거가 이것이다.

이 규칙들을 `@layer`로 감싸면 prose에 밀려서 코드블록 스타일이 사라진다.

(작업 중 이 부분을 특이도만 보고 "prose가 이긴다"고 잘못 판단한 적이 있다. 실제 판정은
빌드된 CSS에서 brace 매칭으로 layer 소속을 확인해야 한다.)

### 3. shiki dual theme은 라이트/다크 규칙이 모두 필요하다

`rehype-pretty-code`를 `theme: { dark, light }` + `keepBackground: false`로 설정했기
때문에, 토큰 span에는 `--shiki-light` / `--shiki-dark` 커스텀 프로퍼티만 붙고 `color`
선언은 없다. globals.css에서 두 모드 각각 `color`, `font-weight`, `font-style`을 매핑해야
한다. 한쪽만 쓰면 그 모드에서 코드가 단색으로 나온다(초기에 라이트 모드가 이 상태였다).

### 4. MDX 동적 import는 확장자를 포함한 파일명 변수로 넘긴다

`blog/[slug]/page.tsx`에서:

```ts
const { default: Post } = await import(`@content/posts/${post.file}`);
```

`PostMeta.file`이 원본 파일명(확장자 포함)을 들고 있는 이유가 이것이다. slug는 정규화되어
파일명과 다를 수 있으므로 slug로는 import할 수 없다.

확장자를 리터럴로 분기하는 방식(`...${base}.md` / `...${base}.mdx`)은 **해당 확장자 파일이
하나도 없으면 Turbopack이 컨텍스트를 만들지 못해 빌드가 깨진다**. 실제로 `.md` 파일이
없는 상태에서 `Can't resolve '@content/posts/' <dynamic> '.md'`로 실패했다.

`@content/*` alias는 `tsconfig.json`의 paths에 정의되어 있다.

### 5. static export에서 라우트 핸들러/이미지 라우트는 `force-static` 필수

`rss.xml`, `og/*.png`, `sitemap.ts`, `robots.ts` 모두 `export const dynamic = "force-static"`을
갖고 있다. 없으면 빌드가 이런 에러로 죽는다:

```
export const dynamic = "force-static"/export const revalidate not configured
on route "/opengraph-image" with "output: export"
```

동적 세그먼트가 있으면 `generateStaticParams`와 `dynamicParams = false`도 함께 필요하다.

### 6. 날짜는 UTC로 포맷한다

`new Date("2026-09-02")`는 UTC 자정으로 파싱되므로, 타임존을 지정하지 않고 포맷하면
빌드 머신의 타임존에 따라 날짜가 하루 밀린다(로컬 KST vs CI UTC). `formatDate`는
`timeZone: "UTC"`를 명시한다. `date.test.ts`에 `TZ=America/Los_Angeles`로 회귀를 잡는
테스트가 있고, `timeZone` 옵션을 제거하면 실제로 실패하는 것을 확인했다(껍데기 테스트가
아니다).

RSS `pubDate`는 `toRfc822`가 파싱 실패 시 null을 반환해 **필드를 생략**한다. 예전에는
`Invalid Date`가 그대로 출력됐고, 이건 피드 리더가 거부할 수 있는 값이다.

### 7. 프론트매터는 YAML 타입에 방어적이어야 한다

`tags: [2026]`처럼 쓰면 YAML이 숫자를 만들고, 예전 코드는 `slugify`에서
`c.toLowerCase is not a function`으로 빌드가 죽었다. 지금은 `normalizeTags`가 모든 원소를
문자열로 강제하고 빈 값을 걸러낸다. `title`/`date`/`summary`도 `typeof === "string"`을
확인한다.

### 8. 태그 slug는 그룹화 키다

`Next.js`와 `next js`는 같은 slug(`next-js`)로 **의도적으로 병합**되어 한 페이지를 공유하고,
표시 이름은 처음 만난 표기를 쓴다. `C++`/`C#`/`C`가 전부 `c`로 뭉치는 문제는 기호를
단어로 치환(`c-plus-plus`, `c-sharp`, `r-and-d`)해서 피했다. 그래도 이론적 충돌은 남아
있으니, 기호 태그를 본격적으로 쓸 거면 명시적 매핑 테이블을 두는 게 낫다.

### 9. 다크모드 토글의 하이드레이션 처리

`theme-toggle.tsx`는 effect에서 setState하지 않고 `useSyncExternalStore`로 마운트를
감지한다(서버 스냅샷 false, 클라이언트 true). effect+setState 방식은 eslint의
`react-hooks/set-state-in-effect`에 걸린다. `aria-pressed`는 마운트 전에는 잘못된 상태를
알리지 않도록 생략된다.

### 10. `mdx-components.tsx`는 프로젝트 루트, 무인자 시그니처

`src/app`을 쓰지만 이 파일은 **프로젝트 루트**에 있어야 한다(현 위치에서 정상 동작 확인).
시그니처는 Next 16 문서대로 `useMDXComponents(): MDXComponents`다. 커스텀 컴포넌트가
실제로 적용되는지는 임시 `data-mdx-probe` 속성을 넣고 빌드해서 확인했다 — 링크가 없는
글로 테스트하면 결과가 무의미하니, **마크다운 링크가 포함된 글**로 확인해야 한다.

### 11. `AGENTS.md`의 nextjs-agent-rules 블록

`next dev`가 이 블록을 파일에 다시 써넣는다. diff에서 지워도 uncommitted 변경으로
되살아나므로, 작업물과 함께 커밋하는 게 트리를 깨끗하게 유지하는 방법이다.

## 검증 방법

```bash
npm test          # vitest, 순수 로직 30개
npm run lint      # eslint
npm run build     # 타입 체크 + 정적 생성 (out/)
npm audit
```

`npm run build`는 tsconfig `include`에 따라 **테스트 파일까지 타입 체크**한다. 참고로
`target: ES2017`이라 정규식 `/s` 플래그를 쓰면 여기서 막힌다.

정적 산출물을 실제로 확인할 때:

```bash
npx serve out -l 4599
curl -sI http://localhost:4599/og/image.png | grep -i content-type   # image/png 확인
```

콘텐츠 관련 엣지케이스는 임시 글을 넣고 빌드해서 확인했다(숫자 태그, 공백 파일명,
중복 slug, 잘못된 날짜, `.md` 확장자). 회귀가 의심되면 같은 방식으로 재현하고 **반드시
임시 파일을 지운 뒤** 다시 빌드해서 `out/`을 정리할 것.

## 아직 안 한 것 / 다음 작업 후보

우선순위 순으로:

1. **배포** — `git push`로 main에 올리면 자동 배포. 아직 안 했다.
2. **`/tags` 인덱스 페이지** — 태그별 페이지는 있지만 전체 태그 목록 페이지가 없다.
   `getAllTags()`가 count까지 주므로 페이지만 만들면 된다.
3. **커스텀 `not-found.tsx`** — 현재는 Next 기본 404(루트 레이아웃은 적용됨).
4. **글 목록 페이지네이션** — 글이 늘어나면 필요. 지금은 `/blog`가 전체를 한 번에 뿌린다.
5. **OG 카드 폰트** — `ImageResponse`가 기본 폰트를 쓴다. 한글 제목이 들어가면 렌더링을
   확인해야 하고, 필요하면 폰트를 로드해 넘겨야 한다. (아직 한글 제목 글로 검증 안 했다.)
6. **JSON-LD 구조화 데이터**(Article/BlogPosting) — SEO 마감용.
7. **RSS 본문 포함** — 지금은 summary만 넣는다. 전문을 넣으려면 MDX를 HTML로 렌더하는
   경로가 필요하다.
8. **prose 스타일 튜닝** — 현재 typography 기본값에 가깝다. Vercel Portfolio 톤에 맞춰
   더 덜어낼 여지가 있다.
9. **접근성 보강** — skip link, 포커스 스타일 점검.
10. **검색** — 정적 사이트라 클라이언트 인덱스(예: 빌드 시 JSON 생성) 방식이 맞다.

## 알려진 트레이드오프

- **푸터 연도는 빌드 시점 값**이다. 정적 사이트에서 클라이언트 계산은 하이드레이션
  문제를 만들고, 콘텐츠 갱신마다 재배포되므로 실용상 문제없다고 판단했다.
- **`posts.ts`의 캐시는 프로덕션 빌드에서만** 동작한다. dev에서는 매번 디렉토리를 읽어
  MDX 편집이 즉시 반영된다.
- **태그 slug 병합**은 위 8번 참고.
- **`out/`은 gitignore** 되어 있다. 배포 산출물은 Actions가 만든다.
