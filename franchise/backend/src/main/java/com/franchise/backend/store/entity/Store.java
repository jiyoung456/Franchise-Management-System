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

    // FK: current_supervisor_id -> users.user_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_supervisor_id")
    private User supervisor;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "address")
    private String address;

    @Column(name = "region_code")
    private String regionCode;

    // 상권 유형 (OFFICE/RESIDENTIAL/STATION/UNIVERSITY/TOURISM/MIXED)
    @Column(name = "trade_area_type")
    private String tradeAreaType;

    @Column(name = "open_planned_at")
    private LocalDateTime openPlannedAt;

    // 가게 상태 (OPEN/CLOSED)
    @Column(name = "store_operation_status")
    private String storeOperationStatus;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // 가게 타입 (FRANCHISE/DIRECT)
    @Column(name = "contract_type")
    private String contractType;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "owner_phone")
    private String ownerPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state", nullable = false)
    private StoreState currentState;

    @Column(name = "current_state_score")
    private Integer currentStateScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
