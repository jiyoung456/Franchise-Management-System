package com.franchise.backend.action.service;

import com.franchise.backend.action.dto.*;
import com.franchise.backend.action.entity.Action;
import com.franchise.backend.action.repository.ActionRepository;
import com.franchise.backend.pos.entity.PosDaily;
import com.franchise.backend.pos.repository.PosDailyRepository;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderActionService {

    private final ActionRepository actionRepository;
    private final PosDailyRepository posDailyRepository;
    private final QscMasterRepository qscMasterRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    // 조치관리  목록:
    // - SUPERVISOR: 본인 담당 점포(storeIds) + 이벤트 연계(relatedEventId not null)
    // - 팀장: 팀장 부서 SV 점포(storeIds) + 이벤트 연계
    // - 관리자: 전체 + 이벤트 연계
    @Transactional(readOnly = true)
    public List<ActionListResponse> getActionList(String loginId, Role role, String status, int limit) {

        String safeLoginId = (loginId == null ? null : loginId.trim());
        if (safeLoginId == null || safeLoginId.isBlank()) return List.of();

        Role safeRole = (role == null ? Role.SUPERVISOR : role);

        // 1) status normalize
        String statusFilter = (status == null || status.isBlank()) ? null : status.trim().toUpperCase();

        // 2) limit normalize
        int safeLimit = Math.max(1, Math.min(limit <= 0 ? 50 : limit, 200));

        List<Action> actions;

        if (safeRole == Role.SUPERVISOR) {
            // SV: 내 담당 점포 id들
            List<Long> storeIds = storeRepository.findStoreIdsBySupervisorLoginId(safeLoginId);
            if (storeIds == null || storeIds.isEmpty()) return List.of();

            actions = actionRepository.findManagerScopedActions(storeIds, statusFilter);

        } else if (safeRole == Role.MANAGER) {
            // 팀장 : 기존 로직 유지(팀장 부서 -> 부서 SV 점포)
            String department = userRepository.findByLoginId(safeLoginId)
                    .map(u -> u.getDepartment() == null ? null : u.getDepartment().trim())
                    .orElse(null);

            if (department == null || department.isBlank()) return List.of();

            List<Long> storeIds = storeRepository.findStoreIdsBySupervisorDepartment(department);
            if (storeIds == null || storeIds.isEmpty()) return List.of();

            actions = actionRepository.findManagerScopedActions(storeIds, statusFilter);

        } else {
            // 관리자 : 전체(이벤트 연계만)
            actions = actionRepository.findAllEventLinkedActions(statusFilter);
        }

        // 3) limit 적용
        if (actions.size() > safeLimit) {
            actions = actions.subList(0, safeLimit);
        }

        // 4) 담당자 이름 매핑 (assignedToUserId -> userName) : N+1 방지
        List<Long> assignedUserIds = actions.stream()
                .map(Action::getAssignedToUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> userNameMap = assignedUserIds.isEmpty()
                ? Map.of()
                : userRepository.findAllById(assignedUserIds).stream()
                .collect(Collectors.toMap(
                        User::getId,
                        u -> {
                            String name = u.getUserName();
                            return (name == null || name.isBlank()) ? "-" : name.trim();
                        },
                        (a, b) -> a
                ));

        // 5) 응답 DTO 변환
        return actions.stream()
                .map(a -> {
                    Long assignedId = a.getAssignedToUserId();
                    String assignedName = (assignedId == null) ? "-" : userNameMap.getOrDefault(assignedId, "-");

                    return new ActionListResponse(
                            a.getId(),
                            a.getTitle(),
                            a.getStoreId(),
                            a.getPriority(),
                            a.getStatus(),
                            a.getDueDate(),
                            a.getAssignedToUserId(),
                            assignedName
                    );
                })
                .toList();
    }

    // 진행중 조치 수 요약 : 이벤트 연계 조치만 집계
    @Transactional(readOnly = true)
    public ActionCountSummaryResponse getSummary(String loginId, Role role) {

        String safeLoginId = (loginId == null ? null : loginId.trim());
        if (safeLoginId == null || safeLoginId.isBlank()) {
            return new ActionCountSummaryResponse(0);
        }

        Role safeRole = (role == null ? Role.SUPERVISOR : role);
        List<String> statuses = List.of("OPEN", "IN_PROGRESS");

        long count;

        if (safeRole == Role.SUPERVISOR) {
            List<Long> storeIds = storeRepository.findStoreIdsBySupervisorLoginId(safeLoginId);
            if (storeIds == null || storeIds.isEmpty()) return new ActionCountSummaryResponse(0);

            count = actionRepository.countInProgressEventLinkedActionsByScope(storeIds, statuses);

        } else if (safeRole == Role.MANAGER) {
            String department = userRepository.findByLoginId(safeLoginId)
                    .map(u -> u.getDepartment() == null ? null : u.getDepartment().trim())
                    .orElse(null);

            if (department == null || department.isBlank()) {
                return new ActionCountSummaryResponse(0);
            }

            List<Long> storeIds = storeRepository.findStoreIdsBySupervisorDepartment(department);
            if (storeIds == null || storeIds.isEmpty()) {
                return new ActionCountSummaryResponse(0);
            }

            count = actionRepository.countInProgressEventLinkedActionsByScope(storeIds, statuses);

        } else {
            count = actionRepository.countAllInProgressEventLinkedActions(statuses);
        }

        return new ActionCountSummaryResponse(count);
    }




    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public ActionEffectResponse getActionEffect(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("조치가 없습니다. id=" + actionId));

        Long storeId = action.getStoreId();
        String metric = action.getTargetMetricCode();
        LocalDate base = action.getDueDate(); // 시행일

        LocalDate startDate = base.minusDays(14);
        LocalDate endDate = base.plusDays(13);

        List<LocalDate> labels = new ArrayList<>();
        for (int i = 0; i < 28; i++) labels.add(startDate.plusDays(i));

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
            ZoneOffset offset = ZoneOffset.ofHours(9);
            OffsetDateTime from = startDate.atStartOfDay().atOffset(offset);
            OffsetDateTime to = endDate.plusDays(1).atStartOfDay().atOffset(offset);

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

        List<BigDecimal> storeSeries = labels.stream()
                .map(d -> valueMap.getOrDefault(d, null))
                .toList();

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
