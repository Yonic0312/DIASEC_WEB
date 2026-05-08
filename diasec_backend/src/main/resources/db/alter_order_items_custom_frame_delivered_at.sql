-- 맞춤액자: 배송완료 시각(150px 썸네일 30일 후 자동 삭제 기준)
-- 적용 후 백엔드 재시작
ALTER TABLE order_items
    ADD COLUMN custom_frame_delivered_at DATETIME NULL DEFAULT NULL
        COMMENT '맞춤액자 배송완료 처리 시각(썸네일 보관 기준)'
    AFTER thumbnail_preview;
