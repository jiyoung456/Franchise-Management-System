-- action_results에 존재하는 result_id 하나를 기준으로 사진 3장 생성

INSERT INTO action_attachments (
    result_id,
    upload_by_user_id,
    photo_url,
    photo_name,
    created_at
)
SELECT
    ar.result_id,
    101,
    'https://s3.amazonaws.com/test-bucket/action/seed/photo1.jpg',
    'before_cleaning.jpg',
    NOW()
FROM action_results ar
ORDER BY ar.result_id
LIMIT 1;

INSERT INTO action_attachments (
    result_id,
    upload_by_user_id,
    photo_url,
    photo_name,
    created_at
)
SELECT
    ar.result_id,
    101,
    'https://s3.amazonaws.com/test-bucket/action/seed/photo2.jpg',
    'after_cleaning.jpg',
    NOW()
FROM action_results ar
ORDER BY ar.result_id
LIMIT 1;

INSERT INTO action_attachments (
    result_id,
    upload_by_user_id,
    photo_url,
    photo_name,
    created_at
)
SELECT
    ar.result_id,
    101,
    'https://s3.amazonaws.com/test-bucket/action/seed/photo3.jpg',
    'store_check.jpg',
    NOW()
FROM action_results ar
ORDER BY ar.result_id
LIMIT 1;
