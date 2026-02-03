package com.franchise.backend.store.entity;

import com.franchise.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "stores")
@NoArgsConstructor
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long id;

    // ===================== 관계 =====================

    // 담당 SV
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_supervisor_id")
    private User supervisor;

    // 생성자 (점포 등록한 관리자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    // ===================== 기본 정보 =====================

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "address")
    private String address;

    @Column(name = "region_code")
    private String regionCode;

    // 상권 유형 (OFFICE / RESIDENTIAL / STATION / UNIVERSITY / TOURISM / MIXED)
    @Column(name = "trade_area_type")
    private String tradeAreaType;

    @Column(name = "open_planned_at")
    private LocalDateTime openPlannedAt;

    // ===================== 운영 상태 =====================

    // OPEN / CLOSED
    @Column(name = "store_operation_status")
    private String storeOperationStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state", nullable = false)
    private StoreState currentState;

    @Column(name = "current_state_score")
    private Integer currentStateScore;

    // ===================== 날짜 =====================

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===================== 계약 / 점주 =====================

    // FRANCHISE / DIRECT
    @Column(name = "contract_type")
    private String contractType;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_phone")
    private String ownerPhone;

    // ===================== 생성 팩토리 =====================

    public static Store create(
            User supervisor,
            User createdBy,
            String storeName,
            String address,
            String regionCode,
            String tradeAreaType,
            LocalDateTime openPlannedAt,
            String ownerName,
            String ownerPhone,
            String contractType,
            LocalDate contractEndDate,
            LocalDateTime now
    ) {
        Store s = new Store();

        // 관계
        s.supervisor = supervisor;
        s.createdBy = createdBy;

        // 기본 정보
        s.storeName = storeName;
        s.address = address;
        s.regionCode = regionCode;
        s.tradeAreaType = tradeAreaType;
        s.openPlannedAt = openPlannedAt;

        // 정책 고정값
        s.storeOperationStatus = "OPEN";
        s.currentState = StoreState.NORMAL;
        s.currentStateScore = 80;

        // 날짜 정책
        s.openedAt = null;
        s.closedAt = null;
        s.deletedAt = null;

        // 계약 / 점주
        s.contractType = contractType;
        s.contractEndDate = contractEndDate;
        s.ownerName = ownerName;
        s.ownerPhone = ownerPhone;

        // 생성/수정 시간
        s.createdAt = now;
        s.updatedAt = now;

        return s;
    }

    // ===================== 변경 메서드 =====================

    public void changeOperationStatus(String newStatus) {
        this.storeOperationStatus = newStatus;
    }

    public void changeStoreName(String newName) {
        this.storeName = newName;
    }

    public void changeOwnerInfo(String newOwnerName, String newOwnerPhone) {
        this.ownerName = newOwnerName;
        this.ownerPhone = newOwnerPhone;
    }

    public void changeSupervisor(User newSupervisor) {
        this.supervisor = newSupervisor;
    }

    public void changeCurrentState(StoreState newState) {
        this.currentState = newState;
    }

    public void touchUpdatedAt(LocalDateTime now) {
        this.updatedAt = now;
    }
}
