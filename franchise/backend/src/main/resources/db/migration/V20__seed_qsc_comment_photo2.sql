DO $$
DECLARE
  v_photo_id BIGINT;
BEGIN
  -- qsc_master에 inspection_id=1이 있을 때만 진행
  IF EXISTS (SELECT 1 FROM qsc_master WHERE inspection_id = 1) THEN

    -- (1) 사진 1장 넣기
    INSERT INTO qsc_inspection_photos (inspection_id, photo_url, photo_name, created_at)
    VALUES (
      1,
      'https://example.com/dummy/qsc/inspection-1/photo-1.jpg',
      'dummy_photo_1.jpg',
      NOW()
    )
    RETURNING photo_id INTO v_photo_id;

    -- (2) AI 분석 결과 1건 넣기 (사진과 연결)
    INSERT INTO qsc_photo_ai_analysis (
      photo_id,
      inspection_id,
      image_risk_score,
      image_tags,
      evidence_text,
      status,
      requested_at,
      completed_at,
      error_message
    )
    VALUES (
      v_photo_id,
      1,
      72,
      '["바닥 청결 미흡"]',  -- 일단 TEXT에 JSON 문자열로 저장
      '바닥 오염 징후가 감지되었습니다.',
      'SUCCESS',
      NOW(),
      NOW(),
      NULL
    );

  END IF;
END $$;
