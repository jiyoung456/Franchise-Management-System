package com.franchise.backend.qsc.service;// package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.AdminQscDashboardResponse;
import com.franchise.backend.qsc.repository.QscDashboardProjection;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminQscDashboardService {

    private final QscMasterRepository qscMasterRepository;
    private final StoreRepository storeRepository;

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    public AdminQscDashboardResponse getMonthlyDashboard(
            LocalDate anyDateInMonth,
            String regionCode,     // null 가능
            String passFilter,     // null / PASS / FAIL
            int limit,
            int offset
    ) {
        MonthRange range = monthRange(anyDateInMonth);

        QscDashboardProjection.AdminSummary s =
                qscMasterRepository.fetchAdminMonthlySummary(range.startInclusive, range.endExclusive);

        long openStoreCount = storeRepository.countByStoreOperationStatus("OPEN");
        long target = openStoreCount * 2L;

        long doneCount = (s == null || s.getDoneCount() == null) ? 0L : s.getDoneCount();
        double completionRate = (target == 0) ? 0.0 : (doneCount * 100.0 / target);

        Double avgScore = (s == null) ? null : s.getAvgScore();
        Long failedStoreCount = (s == null || s.getFailedStoreCount() == null) ? 0L : s.getFailedStoreCount();

        Map<String, Long> gradeDist = new LinkedHashMap<>();
        gradeDist.put("S", (s == null || s.getGradeS() == null) ? 0L : s.getGradeS());
        gradeDist.put("A", (s == null || s.getGradeA() == null) ? 0L : s.getGradeA());
        gradeDist.put("B", (s == null || s.getGradeB() == null) ? 0L : s.getGradeB());
        gradeDist.put("C", (s == null || s.getGradeC() == null) ? 0L : s.getGradeC());
        gradeDist.put("D", (s == null || s.getGradeD() == null) ? 0L : s.getGradeD());

        List<QscDashboardProjection.AdminListRow> rows =
                qscMasterRepository.fetchAdminMonthlyLatestList(
                        range.startInclusive,
                        range.endExclusive,
                        regionCode,
                        passFilter,
                        limit,
                        offset
                );

        List<AdminQscDashboardResponse.ListRow> mapped = rows.stream()
                .map(r -> new AdminQscDashboardResponse.ListRow(
                        r.getStoreId(),
                        r.getStoreName(),
                        r.getRegionCode(),
                        r.getSupervisorName(),
                        r.getInspectedAt(),
                        r.getTotalScore(),
                        r.getGrade(),
                        r.getIsPassed()
                ))
                .toList();

        AdminQscDashboardResponse.Summary summary =
                new AdminQscDashboardResponse.Summary(avgScore, completionRate, failedStoreCount, gradeDist);

        AdminQscDashboardResponse.ListRowPage page =
                new AdminQscDashboardResponse.ListRowPage(limit, offset, mapped);

        return new AdminQscDashboardResponse(summary, page);
    }

    private MonthRange monthRange(LocalDate anyDateInMonth) {
        LocalDate firstDay = anyDateInMonth.withDayOfMonth(1);
        LocalDate firstDayNextMonth = firstDay.plusMonths(1);

        // KST 기준 월 시작/끝을 OffsetDateTime으로
        OffsetDateTime start = firstDay.atStartOfDay(KST).toOffsetDateTime();
        OffsetDateTime end = firstDayNextMonth.atStartOfDay(KST).toOffsetDateTime();

        return new MonthRange(start, end);
    }

    private record MonthRange(OffsetDateTime startInclusive, OffsetDateTime endExclusive) {}
}