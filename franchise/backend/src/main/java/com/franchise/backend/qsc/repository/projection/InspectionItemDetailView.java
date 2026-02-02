package com.franchise.backend.qsc.repository.projection;

public interface InspectionItemDetailView {
    Long getTemplateItemId();
    Integer getScore();

    Long getCategoryId();
    String getCategoryCode();
    String getCategoryName();
    Integer getCategoryWeight();

    String getItemName();
    Integer getSortOrder();
}
