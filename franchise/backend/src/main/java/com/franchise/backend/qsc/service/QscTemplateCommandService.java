package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.entity.*;
import com.franchise.backend.qsc.repository.*;
import com.franchise.backend.qsc.dto.QscTemplateDetailResponse;
import com.franchise.backend.qsc.dto.QscTemplateUpsertRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class QscTemplateCommandService {

    private final QscTemplateRepository templateRepository;
    private final QscTemplateScopeRepository scopeRepository;
    private final QscTemplateCategoryRepository categoryRepository;
    private final QscTemplateItemRepository itemRepository;

    private final QscTemplateDetailService detailService;

    // 규칙: 카테고리별 "문항 수(=중분류 수로 해석)" 고정
    private static final Map<QscCategoryCode, Integer> REQUIRED_ITEM_COUNTS = Map.of(
            QscCategoryCode.QUALITY, 6,
            QscCategoryCode.SERVICE, 6,
            QscCategoryCode.CLEANLINESS, 6,
            QscCategoryCode.SAFETY, 2
    );

    // 규칙: 카테고리 점수(최대) = 문항수 * 5 (프론트가 weight로 보내면 검증 가능)
    private static final Map<QscCategoryCode, Integer> REQUIRED_WEIGHTS = Map.of(
            QscCategoryCode.QUALITY, 30,
            QscCategoryCode.SERVICE, 30,
            QscCategoryCode.CLEANLINESS, 30,
            QscCategoryCode.SAFETY, 10
    );

    @Transactional
    public QscTemplateDetailResponse createTemplate(Long createdByUserId, QscTemplateUpsertRequest req) {
        validateUpsert(req);

        QscTemplate template = QscTemplate.create(
                createdByUserId,
                req.templateName(),
                QscInspectionType.valueOf(req.inspectionType()),
                req.version(),
                req.effectiveFrom(),
                req.effectiveTo(),
                req.passScoreMin(),
                req.status() == null ? QscTemplateStatus.ACTIVE : QscTemplateStatus.valueOf(req.status())
        );
        templateRepository.save(template);

        upsertScope(template, req.scope());
        upsertCategoriesAndItems(template, req.categories());

        return detailService.getDetail(template.getId());
    }

    @Transactional
    public QscTemplateDetailResponse updateTemplate(Long templateId, QscTemplateUpsertRequest req) {
        validateUpsert(req);

        QscTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found. id=" + templateId));

        template.updateBasic(
                req.templateName(),
                QscInspectionType.valueOf(req.inspectionType()),
                req.version(),
                req.effectiveFrom(),
                req.effectiveTo(),
                req.passScoreMin(),
                req.status() == null ? null : QscTemplateStatus.valueOf(req.status())
        );

        // scope는 단순히 전체 교체
        scopeRepository.deleteByTemplate_Id(templateId);
        upsertScope(template, req.scope());

        // 카테고리/문항도 전체 교체(가장 안전하고 구현 쉬움)
        // (원하면 upsert로 바꿀 수 있지만, 초기에 이게 버그 적음)
        itemRepository.deleteByTemplate_Id(templateId);
        categoryRepository.deleteByTemplate_Id(templateId);

        upsertCategoriesAndItems(template, req.categories());

        return detailService.getDetail(templateId);
    }

    private void upsertScope(QscTemplate template, QscTemplateUpsertRequest.Scope scope) {
        if (scope == null) return;

        QscScopeType type = QscScopeType.valueOf(scope.scopeType());
        Long refId = scope.scopeRefId();

        if (type != QscScopeType.GLOBAL && refId == null) {
            throw new IllegalArgumentException("scopeRefId is required for scopeType=" + type);
        }
        if (type == QscScopeType.GLOBAL && refId != null) {
            throw new IllegalArgumentException("scopeRefId must be null for GLOBAL");
        }

        scopeRepository.save(QscTemplateScope.create(template, type, refId));
    }

    private void upsertCategoriesAndItems(QscTemplate template, List<QscTemplateUpsertRequest.Category> reqCategories) {
        Map<QscCategoryCode, QscTemplateUpsertRequest.Category> byCode = new EnumMap<>(QscCategoryCode.class);
        for (QscTemplateUpsertRequest.Category c : reqCategories) {
            QscCategoryCode code = QscCategoryCode.valueOf(c.categoryCode());
            byCode.put(code, c);
        }

        for (QscCategoryCode code : REQUIRED_ITEM_COUNTS.keySet()) {
            QscTemplateUpsertRequest.Category c = byCode.get(code);
            if (c == null) throw new IllegalArgumentException("Missing category: " + code);

            QscTemplateCategory savedCategory = categoryRepository.save(
                    QscTemplateCategory.create(template, code, c.categoryName(), c.categoryWeight())
            );

            List<QscTemplateUpsertRequest.Item> items = (c.items() == null ? List.of() : c.items());
            // sortOrder 기본 정렬/검증은 validateUpsert에서 함

            List<QscTemplateItem> entities = new ArrayList<>();
            for (QscTemplateUpsertRequest.Item i : items) {
                entities.add(QscTemplateItem.create(
                        template,
                        savedCategory,
                        i.itemName(),
                        i.isRequired(),
                        i.sortOrder()
                ));
            }
            itemRepository.saveAll(entities);
        }
    }

    private void validateUpsert(QscTemplateUpsertRequest req) {
        if (req.templateName() == null || req.templateName().isBlank()) {
            throw new IllegalArgumentException("templateName is required");
        }
        if (req.inspectionType() == null) throw new IllegalArgumentException("inspectionType is required");
        if (req.version() == null || req.version().isBlank()) throw new IllegalArgumentException("version is required");
        if (req.effectiveFrom() == null) throw new IllegalArgumentException("effectiveFrom is required");

        if (req.passScoreMin() == null || req.passScoreMin() < 1 || req.passScoreMin() > 100) {
            throw new IllegalArgumentException("passScoreMin must be between 1 and 100");
        }

        if (req.categories() == null) throw new IllegalArgumentException("categories is required");

        // 1) 카테고리 4개 필수
        Set<QscCategoryCode> incoming = new HashSet<>();
        for (var c : req.categories()) {
            if (c.categoryCode() == null) throw new IllegalArgumentException("categoryCode is required");
            incoming.add(QscCategoryCode.valueOf(c.categoryCode()));
        }
        if (!incoming.containsAll(REQUIRED_ITEM_COUNTS.keySet()) || incoming.size() != REQUIRED_ITEM_COUNTS.size()) {
            throw new IllegalArgumentException("categories must include exactly: " + REQUIRED_ITEM_COUNTS.keySet());
        }

        // 2) 카테고리별 문항 수 고정 + weight 검증(원하면 끌 수 있음)
        int totalWeight = 0;

        for (var c : req.categories()) {
            QscCategoryCode code = QscCategoryCode.valueOf(c.categoryCode());

            List<QscTemplateUpsertRequest.Item> items = (c.items() == null ? List.of() : c.items());
            int requiredCount = REQUIRED_ITEM_COUNTS.get(code);
            if (items.size() != requiredCount) {
                throw new IllegalArgumentException(code + " items count must be " + requiredCount);
            }

            // itemName / sortOrder 기본 검증
            Set<Integer> sortOrders = new HashSet<>();
            for (var i : items) {
                if (i.itemName() == null || i.itemName().isBlank()) {
                    throw new IllegalArgumentException(code + " itemName is required");
                }
                if (i.sortOrder() == null) throw new IllegalArgumentException(code + " sortOrder is required");
                if (!sortOrders.add(i.sortOrder())) {
                    throw new IllegalArgumentException(code + " sortOrder duplicate: " + i.sortOrder());
                }
            }

            if (c.categoryWeight() == null) {
                throw new IllegalArgumentException(code + " categoryWeight is required");
            }
            int requiredWeight = REQUIRED_WEIGHTS.get(code);
            if (!Objects.equals(c.categoryWeight(), requiredWeight)) {
                throw new IllegalArgumentException(code + " categoryWeight must be " + requiredWeight);
            }
            totalWeight += c.categoryWeight();
        }

        if (totalWeight != 100) {
            throw new IllegalArgumentException("Total categoryWeight must be 100");
        }
    }
}
