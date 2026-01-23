-- 1) 테이블 생성
DROP TABLE IF EXISTS board_post;

CREATE TABLE board_post (
  post_id             BIGSERIAL PRIMARY KEY,
  created_by_user_id  BIGINT NOT NULL,
  updated_by_user_id  BIGINT NULL,
  title               VARCHAR(255),
  content             TEXT,
  is_pinned           BOOLEAN DEFAULT FALSE,
  view_count          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2) 더미 데이터 20개
INSERT INTO board_post
(created_by_user_id, updated_by_user_id, title, content, is_pinned, view_count, created_at, updated_at)
VALUES
(1, NULL, '공지: 이용 규칙 안내', '게시판 이용 규칙을 확인해주세요. 서로 존중하는 대화를 부탁드립니다.', TRUE, 128, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(2, 2,    '업데이트 안내 v1.0', '기능 업데이트가 적용되었습니다. 변경사항은 공지사항을 참고해주세요.', TRUE, 96,  NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days'),

(1, NULL, '자유글: 오늘 점심 추천?', '오늘 점심 뭐 먹을지 고민입니다. 추천 부탁!', FALSE, 34, NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
(2, NULL, '질문: 로그인 오류', '간헐적으로 로그인 실패가 나요. 재현 방법 공유합니다.', FALSE, 51, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),
(1, 1,    '후기: 신규 기능 써봄', '새 기능 써봤는데 꽤 편하네요. 개선 아이디어도 남깁니다.', FALSE, 22, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
(2, NULL, '모임: 이번 주 스터디', '이번 주 토요일 오후 2시에 스터디 합니다. 참여자 댓글 남겨주세요.', FALSE, 18, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),

(1, NULL, '버그 제보: 검색 필터', '검색 필터 적용 시 결과가 0으로 나오는 케이스가 있어요.', FALSE, 40, NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
(2, 2,    '개선 제안: 다크모드', '다크모드 색 대비가 조금 더 높으면 좋겠습니다.', FALSE, 27, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
(1, NULL, '자유글: 주말 계획', '다들 주말에 뭐 하시나요?', FALSE, 15, NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
(2, NULL, '질문: 알림 설정', '이메일 알림/푸시 알림 끄는 방법이 궁금합니다.', FALSE, 19, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

(1, 2,    '공지: 점검 일정', '서버 점검이 예정되어 있습니다. 점검 시간 동안 접속이 제한됩니다.', TRUE, 210, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days'),
(2, NULL, '후기: 고객센터 응대', '문의했는데 답변이 빨라서 좋았어요. 칭찬합니다!', FALSE, 12, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

(1, NULL, '공유: 유용한 링크 모음', '업무에 도움되는 링크 몇 개 공유합니다.', FALSE, 66, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(2, 1,    '토론: 기능 우선순위', '다음 분기에 어떤 기능부터 하는 게 좋을까요? 의견 부탁해요.', FALSE, 49, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
(1, NULL, '질문: 게시물 수정', '게시물 수정하면 수정일이 자동 반영되나요?', FALSE, 21, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(2, NULL, '자유글: 추천 음악', '요즘 듣는 음악 추천해 주세요!', FALSE, 9, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

(1, 1,    '버그 제보: 모바일 레이아웃', '모바일에서 버튼이 겹쳐 보입니다. 스크린샷 첨부 가능해요.', FALSE, 31, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
(2, NULL, '개선 제안: 첨부파일', '첨부파일 업로드 용량 제한을 조금 늘리면 좋겠어요.', FALSE, 24, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(1, NULL, '자유글: 첫 글입니다', '안녕하세요! 잘 부탁드립니다 :)', FALSE, 7, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
(2, 2,    '공지: 이벤트 안내', '커뮤니티 이벤트를 진행합니다. 참여 방법은 본문을 확인해주세요.', TRUE, 143, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours');
