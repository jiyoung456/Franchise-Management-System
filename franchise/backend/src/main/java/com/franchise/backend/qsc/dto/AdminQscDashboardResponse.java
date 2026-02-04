package com.franchise.backend.qsc.dto;// package com.franchise.backend.qsc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.List;

@Getter
@AllArgsConstructor
public class AdminQscDashboardResponse {

    private Summary summary;
    private ListRowPage list;

    @Getter
    @AllArgsConstructor
    public static class Summary {
        private Double avgScore;           // 예: 77.1
        private Double completionRate;     // 예: 0.0 ~ 100.0
        private Long failedStoreCount;     // C/D 점포 수 (월 최신점검 기준)
        private Map<String, Long> gradeDistribution; // S/A/B/C/D
    }

    @Getter
    @AllArgsConstructor
    public static class ListRowPage {
        private int limit;
        private int offset;
        private List<ListRow> rows;
    }

    @Getter
    @AllArgsConstructor
    public static class ListRow {
        private Long storeId;
        private String storeName;
        private String regionCode;
        private String supervisorName;
        private Instant inspectedAt;
        private Integer totalScore;
        private String grade;
        private Boolean passed;
    }
}
