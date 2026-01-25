ALTER TABLE qsc_master
    ALTER COLUMN grade TYPE VARCHAR(1);

UPDATE qsc_master
SET grade = UPPER(TRIM(grade))
WHERE grade IS NOT NULL;

ALTER TABLE qsc_master
    ADD CONSTRAINT ck_qsc_master_grade
    CHECK (grade IN ('S','A','B','C','D'));
