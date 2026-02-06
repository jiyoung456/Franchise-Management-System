package com.franchise.backend.qsc.repository.projection;

import java.time.OffsetDateTime;

public interface QscInspectionListView {
    Long getInspectionId();
    Long getStoreId();
    String getStoreName();
    String getRegionCode();
    String getStatus();
    String getInspectorName();
    OffsetDateTime getInspectedAt();
    Integer getTotalScore();
    String getGrade();
    Boolean getIsPassed();
}
