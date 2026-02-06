package com.franchise.backend.store.service;

import com.franchise.backend.action.repository.ActionRepository;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.pos.entity.PosPeriodAgg;
import com.franchise.backend.pos.repository.PosPeriodAggRepository;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.store.dto.AdminDashboardSummaryResponse;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final StoreRepository storeRepository;
    private final EventLogRepository eventLogRepository;
    private final ActionRepository actionRepository;
    private final QscMasterRepository qscMasterRepository;
    private final PosPeriodAggRepository posPeriodAggRepository;

    public AdminDashboardSummaryResponse getAdminSummary() {

        // =========================
        // 1) 기존 카드/Top5
        // =========================

        long totalStoreCount = storeRepository.count();

        long riskStoreCount = storeRepository.countByCurrentState(StoreState.RISK);

        OffsetDateTime since = OffsetDateTime.now(ZoneOffset.UTC).minusHours(48);
        long newEventCount = eventLogRepository.countNewEventsSince(since);

        long pendingActionCount =
                actionRepository.countAllInProgressEventLinkedActions(
                        List.of("OPEN", "IN_PROGRESS")
                );

        List<Store> topStores =
                storeRepository.findTopRiskStores(PageRequest.of(0, 5));

        List<AdminDashboardSummaryResponse.RiskStoreTopResponse> riskTop5 =
                topStores.stream()
                        .map(s -> new AdminDashboardSummaryResponse.RiskStoreTopResponse(
                                s.getId(),
                                s.getStoreName(),
                                s.getCurrentStateScore() == null ? 0 : s.getCurrentStateScore()
                        ))
                        .toList();

        // =========================
        // 2) 차트용 기간
        // =========================

        ZoneId seoul = ZoneId.of("Asia/Seoul");

// ✅ 지금은 테스트용 anchor (2025-08-31 기준)
        LocalDate anchor = LocalDate.of(2025, 8, 31);

        LocalDate fromMonthStart = anchor.withDayOfMonth(1).minusMonths(5); // 2025-03-01
        LocalDate thisMonthStart = anchor.withDayOfMonth(1);               // 2025-08-01
        // 이번달 1일

        OffsetDateTime startInclusive = fromMonthStart.atStartOfDay(seoul).toOffsetDateTime();
        OffsetDateTime endExclusive   = thisMonthStart.plusMonths(1).atStartOfDay(seoul).toOffsetDateTime();

        // =========================
        // 3) 평균 QSC 점수 추이(월별)
        // =========================

        List<AdminDashboardSummaryResponse.MonthlyQscTrend> avgQscTrend =
                qscMasterRepository.fetchAdminTrend(startInclusive, endExclusive)
                        .stream()
                        .map(r -> new AdminDashboardSummaryResponse.MonthlyQscTrend(
                                r.getMonth(),
                                r.getAvgScore() == null ? 0.0 : r.getAvgScore().doubleValue()
                        ))
                        .toList();

        // =========================
        // 4) 전체 매출 변화율(월별)
        //    - 월별 총매출(sum) 가져와서 전월 대비 변화율 계산
        // =========================

        List<PosPeriodAggRepository.AdminMonthlySalesProjection> salesRows =
                posPeriodAggRepository.findAdminMonthlySalesSum(
                        PosPeriodAgg.PosPeriodType.MONTH,
                        fromMonthStart,
                        thisMonthStart
                );

        List<AdminDashboardSummaryResponse.MonthlySalesChangeTrend> salesChangeTrend = new ArrayList<>();
        BigDecimal prev = null;

        DateTimeFormatter ym = DateTimeFormatter.ofPattern("yyyy-MM");

        for (PosPeriodAggRepository.AdminMonthlySalesProjection row : salesRows) {
            BigDecimal cur = row.getTotalSales() == null ? BigDecimal.ZERO : row.getTotalSales();

            Double changeRate = null; // 첫 달은 비교대상 없으니 null
            if (prev != null) {
                if (prev.compareTo(BigDecimal.ZERO) == 0) {
                    changeRate = 0.0; // 규칙: 전월 0이면 0% (원하면 null로 바꿔도 됨)
                } else {
                    changeRate = cur.subtract(prev)
                            .divide(prev, 6, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                }
            }

            String month = row.getPeriodStart().format(ym);
            salesChangeTrend.add(new AdminDashboardSummaryResponse.MonthlySalesChangeTrend(month, changeRate));
            prev = cur;
        }

        System.out.println("avgQscTrend size = " + avgQscTrend.size());
        System.out.println("salesRows size = " + salesRows.size());
        System.out.println("salesChangeTrend size = " + salesChangeTrend.size());




        // =========================
        // 5) 최종 응답
        // =========================

        return new AdminDashboardSummaryResponse(
                totalStoreCount,
                riskStoreCount,
                newEventCount,
                pendingActionCount,
                riskTop5,
                avgQscTrend,
                salesChangeTrend
        );
    }
}
