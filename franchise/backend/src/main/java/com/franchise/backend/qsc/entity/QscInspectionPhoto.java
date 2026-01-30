package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_inspection_photos")
public class QscInspectionPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Long id;

    @Column(name = "inspection_id", nullable = false)
    private Long inspectionId;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    @Column(name = "photo_name")
    private String photoName;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }

    public static QscInspectionPhoto create(Long inspectionId, String photoUrl, String photoName) {
        QscInspectionPhoto p = new QscInspectionPhoto();
        p.inspectionId = inspectionId;
        p.photoUrl = photoUrl;
        p.photoName = photoName;
        return p;
    }
}
