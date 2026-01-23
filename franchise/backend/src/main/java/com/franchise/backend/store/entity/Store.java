package com.franchise.backend.store.entity;

import com.franchise.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_supervisor_id")
    private User supervisor;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "region_code")
    private String regionCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state", nullable = false)
    private StoreState currentState;

    @Column(name = "current_state_score")
    private Integer currentStateScore;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
