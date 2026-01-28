package com.franchise.backend.action.service;

import com.franchise.backend.action.dto.ActionListResponse;
import com.franchise.backend.action.entity.Action;
import com.franchise.backend.action.repository.ActionRepository;
import org.springframework.stereotype.Service;
import com.franchise.backend.action.dto.ActionDetailResponse;
import com.franchise.backend.action.dto.ActionCreateRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Transactional;
import com.franchise.backend.action.dto.ActionUpdateRequest;


import java.util.List;
import com.franchise.backend.action.dto.ActionEffectResponse;
import com.franchise.backend.pos.entity.PosDaily;
import com.franchise.backend.qsc.entity.QscMaster;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import com.franchise.backend.pos.repository.PosDailyRepository;
import com.franchise.backend.qsc.repository.QscMasterRepository;
@Service
public class LeaderActionService {

    private final ActionRepository actionRepository;
    private final PosDailyRepository posDailyRepository;
    private final QscMasterRepository qscMasterRepository;

    public LeaderActionService(ActionRepository actionRepository,
                               PosDailyRepository posDailyRepository,
                               QscMasterRepository qscMasterRepository) {
        this.actionRepository = actionRepository;
        this.posDailyRepository = posDailyRepository;
        this.qscMasterRepository = qscMasterRepository;
    }

    public List<ActionListResponse> getActionList() {
        List<Action> actions = actionRepository.findAllByOrderByPriorityAscDueDateAsc();

        return actions.stream()
                .map(a -> new ActionListResponse(
                        a.getId(),
                        a.getTitle(),
                        a.getStoreId(),
                        a.getPriority(),
                        a.getStatus(),
                        a.getDueDate(),
                        a.getAssignedToUserId()
                ))
                .toList();
    }

    public ActionDetailResponse getActionDetail(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("조치가 존재하지 않습니다. id=" + actionId));

        return new ActionDetailResponse(
                action.getId(),
                action.getStoreId(),
                action.getRelatedEventId(),
                action.getActionType(),
                action.getTitle(),
                action.getDescription(),
                action.getPriority(),
                action.getStatus(),
                action.getTargetMetricCode(),
                action.getDueDate(),
                action.getAssignedToUserId(),
                action.getCreatedByUserId(),
                action.getCreatedAt(),
                action.getUpdatedAt()
        );
    }

    @Transactional
    public Long createAction(ActionCreateRequest req, Long createdByUserId) {

        Action action = new Action(
                req.getStoreId(),
                req.getRelatedEventId(),
                req.getActionType(),
                req.getAssignedToUserId(),
                req.getTargetMetricCode(),
                req.getDueDate(),
                req.getPriority(),
                req.getTitle(),
                req.getDescription(),
                createdByUserId
        );

        Action saved = actionRepository.save(action);
        return saved.getId();
    }


    @Transactional
    public void updateAction(Long actionId, ActionUpdateRequest req) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("조치가 없습니다. id=" + actionId));

        action.update(
                req.getActionType(),
                req.getTargetMetricCode(),
                req.getDueDate(),
                req.getPriority(),
                req.getTitle(),
                req.getDescription()
        );
    }

    public ActionEffectResponse getActionEffect(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("조치가 없습니다. id=" + actionId));

        Long storeId = action.getStoreId();
        String metric = action.getTargetMetricCode();
        LocalDate base = action.getDueDate(); // 시행일

        LocalDate startDate = base.minusDays(14);
        LocalDate endDate = base.plusDays(13);

        // labels 28개
        List<LocalDate> labels = new ArrayList<>();
        for (int i = 0; i < 28; i++) labels.add(startDate.plusDays(i));

        // 날짜별 값 맵
        Map<LocalDate, BigDecimal> valueMap = new HashMap<>();

        if (metric.startsWith("POS_")) {
            List<PosDaily> rows = posDailyRepository
                    .findByStoreIdAndBusinessDateBetweenOrderByBusinessDateAsc(storeId, startDate, endDate);

            for (PosDaily r : rows) {
                BigDecimal v = null;
                switch (metric) {
                    case "POS_SALES" -> v = r.getSalesAmount();
                    case "POS_MARGIN" -> v = r.getMarginAmount();
                    case "POS_ORDER_COUNT" -> v = BigDecimal.valueOf(r.getOrderCount());
                    case "POS_AVG_TICKET" -> {
                        if (r.getOrderCount() != null && r.getOrderCount() > 0) {
                            v = r.getSalesAmount().divide(BigDecimal.valueOf(r.getOrderCount()), 2, RoundingMode.HALF_UP);
                        }
                    }
                }
                valueMap.put(r.getBusinessDate(), v);
            }
        } else if (metric.startsWith("QSC_")) {
            // QSC는 inspectedAt이 OffsetDateTime이라 범위를 OffsetDateTime으로 잡음
            ZoneOffset offset = ZoneOffset.ofHours(9); // KST 기준(필요시 UTC로 바꿔도 됨)
            OffsetDateTime from = startDate.atStartOfDay().atOffset(offset);
            OffsetDateTime to = endDate.plusDays(1).atStartOfDay().atOffset(offset); // endDate 포함

            List<QscMaster> rows = qscMasterRepository
                    .findByStoreIdAndInspectedAtBetweenOrderByInspectedAtAsc(storeId, from, to);

            for (QscMaster r : rows) {
                LocalDate d = r.getInspectedAt().toLocalDate();
                Integer score = r.getTotalScore();
                valueMap.put(d, score == null ? null : BigDecimal.valueOf(score));
            }
        } else {
            throw new IllegalArgumentException("지원하지 않는 metricCode: " + metric);
        }

        // storeSeries (28개)
        List<BigDecimal> storeSeries = labels.stream()
                .map(d -> valueMap.getOrDefault(d, null))
                .toList();

        // ✅ 조치 전 14일 평균 계산 (startDate ~ base-1)
        LocalDate preStart = startDate;
        LocalDate preEnd = base.minusDays(1);

        List<BigDecimal> preValues = new ArrayList<>();
        for (LocalDate d = preStart; !d.isAfter(preEnd); d = d.plusDays(1)) {
            BigDecimal v = valueMap.get(d);
            if (v != null) preValues.add(v);
        }

        BigDecimal baselineValue = null;
        if (!preValues.isEmpty()) {
            BigDecimal sum = preValues.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            baselineValue = sum.divide(BigDecimal.valueOf(preValues.size()), 2, RoundingMode.HALF_UP);
        }

        // baselineSeries: 28개 전부 baselineValue (없으면 null)
        BigDecimal finalBaselineValue = baselineValue;
        List<BigDecimal> baselineSeries = labels.stream()
                .map(d -> finalBaselineValue)
                .toList();

        return new ActionEffectResponse(
                actionId, storeId, metric, base,
                labels, storeSeries, baselineSeries, baselineValue
        );
    }



}
