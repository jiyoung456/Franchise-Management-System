package com.franchise.backend.event.service;

import com.franchise.backend.event.dto.EventDetailResponse;
import com.franchise.backend.event.repository.EventDetailRepository;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventDetailService {

    private final EventDetailRepository eventDetailRepository;
    private final QscMasterRepository qscMasterRepository;

    // 이벤트 상세
    @Transactional(readOnly = true)
    public EventDetailResponse getEventDetail(Long eventId) {

        EventDetailResponse base = eventDetailRepository.findEventDetail(eventId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이벤트입니다. eventId=" + eventId));

        // QSC 이벤트일 때만 분석정보 채움
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

        // POS/AI/조치 등은 일단 analysis null (추후 확장)
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
            // 점검이 없으면 분석 정보 없음
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

        return new EventDetailResponse.AnalysisResponse(
                latestScore,
                latestGrade,
                diffFromPrev,
                weakCategory,
                latest.getInspectedAt()
        );
    }

    // 취약 카테고리: eventType 우선, 없으면 summary에서 키워드 추정
    private String resolveWeakCategoryName(String eventType, String summary) {

        String t = (eventType == null ? "" : eventType.toUpperCase());

        // eventType에 카테고리가 포함되는 케이스 대응
        if (t.contains("HYGIENE")) return "위생 (Cleanliness)";
        if (t.contains("SERVICE")) return "서비스 (Service)";
        if (t.contains("QUALITY")) return "품질 (Quality)";
        if (t.contains("SAFETY"))  return "안전 (Safety)";

        String s = (summary == null ? "" : summary);

        // summary에 한글 키워드가 있는 케이스 대응
        if (s.contains("위생")) return "위생 (Cleanliness)";
        if (s.contains("서비스")) return "서비스 (Service)";
        if (s.contains("품질")) return "품질 (Quality)";
        if (s.contains("안전")) return "안전 (Safety)";

        // 못 찾으면 null
        return null;
    }
}
