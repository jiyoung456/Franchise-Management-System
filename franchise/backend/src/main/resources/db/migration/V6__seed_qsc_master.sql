-- =====================================================
-- QSC 더미 데이터
-- =====================================================

INSERT INTO qsc_master (
    store_id,
    template_id,
    inspector_id,
    inspected_at,
    status,
    total_score,
    grade,
    is_passed,
    needs_reinspection,
    summary_comment,
    confirmed_at
)
VALUES
-- 정상 점포 (S/A)
(1, 1, 3, NOW() - INTERVAL '3 days', 'COMPLETED', 96, 'S', TRUE, FALSE, '전반적으로 매우 우수함', NOW()),
(2, 1, 4, NOW() - INTERVAL '5 days', 'COMPLETED', 92, 'A', TRUE, FALSE, '위생 및 서비스 양호', NOW()),

-- 경계 점포 (B)
(3, 1, 5, NOW() - INTERVAL '7 days', 'COMPLETED', 85, 'B', TRUE, FALSE, '일부 서비스 응대 개선 필요', NOW()),
(4, 1, 6, NOW() - INTERVAL '10 days', 'COMPLETED', 82, 'B', TRUE, FALSE, '조리 동선 개선 권고', NOW()),

-- 위험 점포 (C/D)
(5, 1, 7, NOW() - INTERVAL '2 days', 'COMPLETED', 74, 'C', FALSE, TRUE, '위생 상태 미흡', NOW()),
(6, 1, 8, NOW() - INTERVAL '1 days', 'COMPLETED', 65, 'D', FALSE, TRUE, '즉각적인 재점검 필요', NOW()),

-- 최근 점검
(7, 1, 3, NOW() - INTERVAL '12 hours', 'COMPLETED', 88, 'B', TRUE, FALSE, '피크타임 대응 보완 필요', NOW()),

-- 임시 저장 상태
(8, 1, 4, NOW() - INTERVAL '1 days', 'DRAFT', 0, 'D', FALSE, FALSE, '점검 진행 중', NULL);
