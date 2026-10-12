# 블로그 홈 태그 목록 구현 계획

## Solution approach

홈 페이지는 현재와 같이 React Server Component로 유지한다. 이미 태그 정규화·중복 제거·빈도순 정렬을 담당하는 `collectTags`와 기존 `/tags/[tag]` 정적 경로가 있으므로 새 데이터 계층이나 클라이언트 상태를 만들지 않는다. 홈에서 읽은 전체 게시글로 태그를 한 번 집계하고, 재사용 가능한 표시 컴포넌트가 이를 반응형 pill 링크 목록으로 렌더링하게 한다.

## Ordered steps

1. **태그 표시 컴포넌트 추가** — `src/components/tag-list.tsx`
   - `TagInfo[]`를 받는 서버 컴포넌트를 만든다.
   - 태그가 없으면 `null`을 반환해 빈 섹션을 숨긴다.
   - 태그가 있으면 `Tags` 제목과 의미 있는 목록 마크업을 출력한다.
   - 각 항목은 `#태그이름`만 보여주는 `next/link` 링크이며 `/tags/${tag.slug}`로 연결한다.
   - Tailwind 유틸리티로 배경·테두리·둥근 모서리·hover/focus 상태와 라이트/다크 색상을 지정하고, 컨테이너는 `flex-wrap`으로 좁은 화면에서 줄바꿈한다. 별도 클라이언트 JavaScript나 전역 CSS는 추가하지 않는다.
   - 검증: `src/components/tag-list.test.tsx`에서 `renderToStaticMarkup`으로 제공된 순서, 레이블, href, pill 스타일 클래스, 게시글 수 미노출, 빈 배열 시 빈 출력 여부를 검사한다.

2. **홈 페이지에 태그 섹션 연결** — `src/app/page.tsx`
   - `getAllPosts()`로 얻은 전체 목록을 최근 글로 자르기 전에 보존하고, 기존 순수 함수 `collectTags()`로 태그를 집계한다. 이렇게 하면 개발 모드에서도 게시글 디렉터리를 중복으로 읽지 않는다.
   - `<TagList>`를 블로그 소개 섹션 다음이자 최근 글 섹션 앞에 삽입한다.
   - 검증: `src/app/page.test.tsx`에서 홈을 정적 마크업으로 렌더링해 소개 → Tags → Recent posts 순서와 실제 콘텐츠 태그 링크 노출을 확인한다.

3. **정렬·중복 제거 계약 보강** — `src/lib/posts.test.ts`
   - 기존 `collectTags` 구현은 변경하지 않고, 동일 빈도 태그가 이름순으로 정렬되는 사례를 추가한다.
   - 기존 빈도 집계, slug 기준 중복 제거, 빈 태그 결과 테스트와 함께 모든 태그 데이터 요구사항을 고정한다.
   - 검증: `npm test -- src/lib/posts.test.ts src/components/tag-list.test.tsx src/app/page.test.tsx`를 실행한다.

4. **통합 검증 및 수동 시각 확인**
   - `npm run lint`와 `npm run build`로 타입, Next.js 규칙, 정적 export 및 모든 `/tags/[tag]` 링크 대상을 검증한다.
   - 개발 서버에서 모바일·데스크톱 폭과 라이트·다크 테마를 확인해 pill이 가로 스크롤 없이 줄바꿈되고 텍스트·테두리·focus 상태가 읽기 쉬운지 확인한다.

## Risks and open questions

- 태그명은 기존 `collectTags` 정책대로 동일한 URL slug를 만드는 표기를 하나의 태그로 합치고, 최초 표기를 화면에 사용한다. 이 동작은 기존 태그 페이지와 일치하며 새 변경에서 손대지 않는다.
- 정적 export 빌드가 성공하려면 홈에 표시된 모든 태그가 기존 `generateStaticParams` 결과에도 있어야 한다. 양쪽 모두 같은 집계 로직을 사용하므로 일관성을 빌드로 확인할 수 있다.
- 반응형 줄바꿈과 테마 가독성은 스타일의 시각적 성격 때문에 자동 검증 대신 수동 확인 대상으로 둔다.
