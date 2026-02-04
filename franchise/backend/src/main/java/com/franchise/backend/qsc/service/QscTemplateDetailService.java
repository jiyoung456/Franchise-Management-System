package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.entity.QscTemplate;
import com.franchise.backend.qsc.entity.QscTemplateCategory;
import com.franchise.backend.qsc.entity.QscTemplateItem;
import com.franchise.backend.qsc.repository.QscTemplateCategoryRepository;
import com.franchise.backend.qsc.repository.QscTemplateItemRepository;
import com.franchise.backend.qsc.repository.QscTemplateRepository;
import com.franchise.backend.qsc.dto.QscTemplateDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QscTemplateDetailService {

    private final QscTemplateRepository templateRepository;
    private final QscTemplateCategoryRepository categoryRepository;
    private final QscTemplateItemRepository itemRepository;

    public QscTemplateDetailResponse getDetail(Long templateId) {

        // 1. 템플릿 조회
        QscTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found. id=" + templateId));

        // 2. 카테고리 조회
        List<QscTemplateCategory> categories =
                categoryRepository.findByTemplate_IdOrderByIdAsc(templateId);

        // 3. 문항 조회 (카테고리, 정렬순)
        List<QscTemplateItem> items =
                itemRepository.findByTemplate_IdOrderByCategory_IdAscSortOrderAsc(templateId);

        // 4. categoryId 기준으로 문항 묶기
        Map<Long, List<QscTemplateDetailResponse.Item>> itemMap =
                items.stream()
                        .collect(Collectors.groupingBy(
                                item -> item.getCategory().getId(),
                                Collectors.mapping(item ->
                                        new QscTemplateDetailResponse.Item(
                                                item.getId(),
                                                item.getItemName(),
                                                item.getIsRequired(),
                                                item.getSortOrder()
                                        ), Collectors.toList())
                        ));

        // 5. 카테고리 DTO 생성
        List<QscTemplateDetailResponse.Category> categoryDtos =
                categories.stream()
                        .map(category -> new QscTemplateDetailResponse.Category(
                                category.getId(),
                                category.getCategoryCode().name(),
                                category.getCategoryName(),
                                category.getCategoryWeight(),
                                itemMap.getOrDefault(category.getId(), List.of())
                        ))
                        .toList();

        // 6. 최종 응답
        return new QscTemplateDetailResponse(
                template.getId(),
                template.getTemplateName(),
                template.getInspectionType().name(),
                template.getVersion(),
                categoryDtos
        );
    }
}
