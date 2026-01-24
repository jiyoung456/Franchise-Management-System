package com.franchise.backend.store.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreUpdateRequest {

    // 운영 상태 설정: stores.store_operation_status (OPEN/CLOSED)
    private String storeOperationStatus;

    // 점포명
    private String storeName;

    // 점주명/연락처
    private String ownerName;
    private String ownerPhone;

    // 담당 SV: users.login_id 로 들어온다고 가정 (sv-uuid-2 같은 값)
    private String supervisorLoginId;

    // 리스크 등급(수동 조정): stores.current_state (NORMAL/WATCHLIST/RISK)
    private String currentState;
}
