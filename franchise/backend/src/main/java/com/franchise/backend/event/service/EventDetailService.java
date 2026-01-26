package com.franchise.backend.event.service;

import com.franchise.backend.event.dto.EventDetailResponse;
import com.franchise.backend.event.repository.EventDetailRepository;
import com.franchise.backend.pos.repository.PosDailyRepository;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventDetailService {

    private final EventDetailRepository eventDetailRepository;
    private final QscMasterRepository qscMasterRepository;
    private final PosDailyRepository posDailyRepository;

    // 이벤트 상세
    @Transactional(readOnly = true)
    public EventDetailResponse getEventDetail(Long eventId) {

        EventDetailResponse base = eventDetailRepository.findEventDetail(eventId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이벤트입니다. eventId=" + eventId));

        // QSC 이벤트: 기존 로직 유지 + 생성자 변경(필드 추가) 반영
        if ("QSC".equals(base.getIssueType())) {

            EventDetailResponse.AnalysisResponse analysis =
                    buildQscAnalysis(base.getStoreId(), base.getEventType(), base.getSummary());

            return new EventDetailResponse(
                    base.getEventId(),
                    base.getStoreId(),
                    base.getStoreName(),
                    base.getEventType(),
                    base.getIssueType(),
                    base.getSeverity(),
                    base.getStatus(),
                    base.getSummary(),
                    base.getOccurredAt(),
                    base.getStoreRiskScore(),
                    analysis
            );
        }

        // POS 이벤트: 주간 매출/전주 대비 변화/원인카테고리 채우기
        if ("POS".equals(base.getIssueType())) {

            EventDetailResponse.AnalysisResponse analysis =
                    buildPosAnalysis(base.getStoreId(), base.getEventType(), base.getSummary());

            return new EventDetailResponse(
                    base.getEventId(),
                    base.getStoreId(),
                    base.getStoreName(),
                    base.getEventType(),
                    base.getIssueType(),
                    base.getSeverity(),
                    base.getStatus(),
                    base.getSummary(),
                    base.getOccurredAt(),
                    base.getStoreRiskScore(),
                    analysis
            );
        }

        // POS/QSC 외는 일단 analysis null (추후 확장)
        return base;
    }


    // QSC 분석: 최근 점검/직전 점검 비교 + 취약 카테고리
    private EventDetailResponse.AnalysisResponse buildQscAnalysis(Long storeId, String eventType, String summary) {

        List<QscMaster> lastTwo = qscMasterRepository.findByStoreIdAndStatusOrderByInspectedAtDesc(
                storeId,
                "COMPLETED",
                PageRequest.of(0, 2)
        );

        if (lastTwo.isEmpty()) {
            return null;
        }

        QscMaster latest = lastTwo.get(0);
        QscMaster prev = (lastTwo.size() >= 2 ? lastTwo.get(1) : null);

        Integer latestScore = latest.getTotalScore();
        String latestGrade = latest.getGrade();

        Integer diffFromPrev = null;
        if (prev != null && prev.getTotalScore() != null && latestScore != null) {
            diffFromPrev = latestScore - prev.getTotalScore(); // (latest - prev)
        }

        String weakCategory = resolveWeakCategoryName(eventType, summary);

        // POS 필드 3개는 null로
        return new EventDetailResponse.AnalysisResponse(
                null, null, null,
                latestScore,
                latestGrade,
                diffFromPrev,
                weakCategory,
                latest.getInspectedAt()
        );
    }


    // POS 분석: 최근 7일 매출 합계 + 직전 7일 대비 변화
    private EventDetailResponse.AnalysisResponse buildPosAnalysis(Long storeId, String eventType, String summary) {

        // [수정] Optional.map() 제거 + 날짜 기반 합계로 변경
        LocalDate today = LocalDate.now();

        // 최근 7일(오늘 포함): today-6 ~ today
        LocalDate recentFrom = today.minusDays(6);
        LocalDate recentTo = today;

        // 직전 7일: today-13 ~ today-7
        LocalDate prevFrom = today.minusDays(13);
        LocalDate prevTo = today.minusDays(7);

        BigDecimal recent7dBd = posDailyRepository.sumSalesBetween(storeId, recentFrom, recentTo);
        BigDecimal prev7dBd = posDailyRepository.sumSalesBetween(storeId, prevFrom, prevTo);

        long recent7d = (recent7dBd == null ? 0L : recent7dBd.longValue());
        long prev7d = (prev7dBd == null ? 0L : prev7dBd.longValue());

        long change = recent7d - prev7d;

        String rootLabel = resolvePosRootCategoryLabel(eventType, summary);

        // QSC 필드들은 null로
        return new EventDetailResponse.AnalysisResponse(
                recent7d,
                change,
                rootLabel,
                null,
                null,
                null,
                null,
                null
        );
    }

    // POS 원인 카테고리 라벨
    private String resolvePosRootCategoryLabel(String eventType, String summary) {

        String t = (eventType == null ? "" : eventType.toUpperCase());
        String s = (summary == null ? "" : summary);

        // eventType 기반 우선
        if (t.contains("SALES_DROP")) return "매출 - 하락";
        if (t.contains("SALES_SPIKE")) return "매출 - 급증";
        if (t.contains("ORDER_DROP")) return "주문 - 하락";

        // summary 보조
        if (s.contains("하락")) return "매출 - 하락";
        if (s.contains("급락")) return "매출 - 하락";
        if (s.contains("급증")) return "매출 - 급증";

        return "매출";
    }

    // 취약 카테고리: eventType 우선, 없으면 summary에서 키워드 추정
    private String resolveWeakCategoryName(String eventType, String summary) {

        String t = (eventType == null ? "" : eventType.toUpperCase());

        if (t.contains("HYGIENE")) return "위생 (Cleanliness)";
        if (t.contains("SERVICE")) return "서비스 (Service)";
        if (t.contains("QUALITY")) return "품질 (Quality)";
        if (t.contains("SAFETY"))  return "안전 (Safety)";

        String s = (summary == null ? "" : summary);

        if (s.contains("위생")) return "위생 (Cleanliness)";
        if (s.contains("서비스")) return "서비스 (Service)";
        if (s.contains("품질")) return "품질 (Quality)";
        if (s.contains("안전")) return "안전 (Safety)";

        return null;
    }
}
