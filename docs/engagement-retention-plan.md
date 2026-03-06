# Nklcb Engagement Retention Plan

## 1) Project Structure Snapshot

### Framework and runtime
- `Next.js 15 + React 19 + TypeScript`
- App Router based routing under `src/app`
- Axios API client under `src/api`
- Global state with `jotai` under `src/store`
- Styling with SCSS and SCSS Modules under `src/styles`

### Core domains
- `src/app/page.tsx`: 메인 홈 (공고, 커뮤니티, 질문 요약)
- `src/app/web/*`: 공고 탐색 (기업/직군 필터 + 카드 목록)
- `src/app/community/*`: 커뮤니티 목록/상세/댓글/좋아요
- `src/app/question/*`: 이번 주 질문 + 익명 코멘트
- `src/app/recruitment-notices/page.tsx`: 외부 공고 링크 리다이렉트 + 클릭 카운트

### Shared layers
- `src/components/*`: UI 컴포넌트 (카드, 검색, 배너, 플로팅, 오버레이)
- `src/hooks/*`: 공통 훅 (유저 상태, 토글, 필터 등)
- `src/lib/*`: 외부 연동/SEO/Query provider
- `src/styles/*`: 전역 스타일 및 도메인/컴포넌트 스타일

## 2) Retention Feature Recommendations

### P0 (implemented)
- 일일 탐색 미션 (홈)
- 목적: 한 세션에서 공고/커뮤니티/질문으로 이동을 유도해 체류시간 및 페이지 뷰 증가
- 방식: 3개 미션 진행률 표시, 클릭 시 해당 섹션 이동/페이지 이동, 진행 상태 로컬 저장

### P1 (implemented)
- 최근 본 공고 카드
- 공고 클릭 히스토리를 저장해서 홈/웹 상단에서 재진입 동선 제공

### P2 (next)
- 커뮤니티 큐레이션 랭킹
- 최신글/댓글많은글/좋아요많은글 탭형 피드로 추가 탐색 유도

### P2 (next)
- 질문 참여 리마인더
- 질문 미참여 유저에게 홈 진입 시 1회 배너 노출 (당일 기준)

## 3) Implemented Deliverable (MVP)

### Added files
- `src/components/common/engagement/daily-mission.tsx`
- `src/styles/components/daily-mission.module.scss`
- `src/components/common/engagement/recent-recruit-board.tsx`
- `src/styles/components/recent-recruit-board.module.scss`
- `src/utils/recentRecruit.ts`

### Updated files
- `src/app/page.tsx`
- `src/app/web/layout.tsx`
- `src/components/card/AnnounceCard.tsx`
- `src/components/card/RecruitCard.tsx`

### Behavior
- 홈에서 "오늘의 탐색 미션" 카드 노출
- 미션 종류:
  - 오늘 공고 훑어보기 (`#ranking-announce`)
  - 커뮤니티 게시글 읽기 (`#community`)
  - 이번 주 질문 참여하기 (`/question`)
- 완료 상태는 KST 기준 날짜 키로 `localStorage` 저장
- 동일 날짜 재방문 시 진행률 복원, 다음 날짜에는 자동 초기화
- 공고 클릭 시 최근 본 공고를 `localStorage`에 저장
- 홈/공고 페이지에서 최근 본 공고를 최대 6개까지 재오픈 가능

## 4) KPI Suggestions

- 세션당 페이지뷰(PV/session)
- 홈 진입 후 2페이지 이상 이동 비율
- 홈 -> 질문 페이지 전환율
- 홈 -> 커뮤니티 섹션 이동률
