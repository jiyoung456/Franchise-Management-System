package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.QscInspectionDetailResponse;
import com.franchise.backend.qsc.entity.QscInspectionItem;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscInspectionItemRepository;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.qsc.repository.QscInspectionPhotoRepository;
import com.franchise.backend.qsc.repository.QscPhotoAiAnalysisRepository;
import com.franchise.backend.qsc.repository.projection.InspectionItemDetailView;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QscInspectionQueryService {

    private final QscMasterRepository masterRepository;
    private final QscInspectionItemRepository itemRepository;
    private final QscInspectionPhotoRepository photoRepository;
    private final QscPhotoAiAnalysisRepository aiRepository;

    public QscInspectionDetailResponse getDetail(Long inspectionId) {

        QscMaster master = masterRepository.findById(inspectionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspection not found. id=" + inspectionId));

        List<QscInspectionItem> items = itemRepository.findByInspectionId(inspectionId);

        List<QscInspectionDetailResponse.ItemScore> itemScores = items.stream()
                .map(i -> new QscInspectionDetailResponse.ItemScore(i.getTemplateItemId(), i.getScore()))
                .toList();

        // ✅ photos 조회
        List<QscInspectionDetailResponse.Photo> photos = photoRepository
                .findByInspectionIdOrderByIdAsc(inspectionId)
                .stream()
                .map(p -> new QscInspectionDetailResponse.Photo(
                        p.getId(),
                        p.getPhotoUrl(),
                        p.getPhotoName(),
                        p.getCreatedAt()
                ))
                .toList();

        // ✅ aiAnalysis 조회(최신 1개)
        QscInspectionDetailResponse.AiAnalysis aiAnalysis = aiRepository
                .findByInspectionIdOrderByAnalysisIdAsc(inspectionId)
                .stream()
                .reduce((first, second) -> second)
                .map(a -> new QscInspectionDetailResponse.AiAnalysis(
                        a.getImageRiskScore(),
                        parseTags(a.getImageTags()),
                        a.getEvidenceText(),
                        a.getStatus().name()
                ))
                .orElse(null);

        // ✅ (왼쪽 화면용) 조인 조회
        List<InspectionItemDetailView> views = itemRepository.findDetailViewsByInspectionId(inspectionId);

        Map<Long, List<QscInspectionDetailResponse.ItemDetail>> itemsByCategoryId = new LinkedHashMap<>();
        Map<Long, CategoryMeta> categoryMetaMap = new LinkedHashMap<>();

        for (InspectionItemDetailView v : views) {
            categoryMetaMap.putIfAbsent(
                    v.getCategoryId(),
                    new CategoryMeta(v.getCategoryId(), v.getCategoryCode(), v.getCategoryName(), v.getCategoryWeight())
            );

            itemsByCategoryId.computeIfAbsent(v.getCategoryId(), k -> new ArrayList<>())
                    .add(new QscInspectionDetailResponse.ItemDetail(
                            v.getTemplateItemId(),
                            v.getItemName(),
                            v.getScore(),
                            5,
                            v.getSortOrder()
                    ));
        }

        List<QscInspectionDetailResponse.Section> sections = new ArrayList<>();
        for (var entry : itemsByCategoryId.entrySet()) {
            CategoryMeta meta = categoryMetaMap.get(entry.getKey());
            sections.add(new QscInspectionDetailResponse.Section(
                    meta.categoryId,
                    meta.categoryCode,
                    meta.categoryName,
                    entry.getValue()
            ));
        }

        List<QscInspectionDetailResponse.CategoryScore> categoryScores = new ArrayList<>();
        for (CategoryMeta meta : categoryMetaMap.values()) {
            List<QscInspectionDetailResponse.ItemDetail> catItems =
                    itemsByCategoryId.getOrDefault(meta.categoryId, List.of());

            int rawSum = catItems.stream().mapToInt(i -> i.score() == null ? 0 : i.score()).sum();
            int rawMax = catItems.size() * 5;

            int scaledScore = 0;
            if (rawMax > 0) {
                scaledScore = (int) Math.round((rawSum * 1.0 / rawMax) * meta.categoryWeight);
            }

            categoryScores.add(new QscInspectionDetailResponse.CategoryScore(
                    meta.categoryId,
                    meta.categoryCode,
                    meta.categoryName,
                    scaledScore,
                    meta.categoryWeight
            ));
        }

        return new QscInspectionDetailResponse(
                master.getInspectionId(),
                master.getTemplateId(),
                master.getStoreId(),
                master.getInspectedAt(),
                master.getStatus(),
                master.getTotalScore(),
                master.getGrade(),
                master.getIsPassed(),
                master.getNeedsReinspection(),
                master.getSummaryComment(),
                itemScores,
                photos,
                aiAnalysis,
                categoryScores,
                sections
        );
    }

    private List<String> parseTags(String raw) {
        if (raw == null || raw.isBlank()) return List.of();

        String s = raw.trim();
        if (s.startsWith("[") && s.endsWith("]")) {
            s = s.substring(1, s.length() - 1).trim();
            if (s.isBlank()) return List.of();

            return Arrays.stream(s.split(","))
                    .map(String::trim)
                    .map(x -> x.replaceAll("^\"|\"$", ""))
                    .filter(x -> !x.isBlank())
                    .toList();
        }

        return Arrays.stream(s.split(","))
                .map(String::trim)
                .filter(x -> !x.isBlank())
                .toList();
    }

    private static record CategoryMeta(
            Long categoryId,
            String categoryCode,
            String categoryName,
            Integer categoryWeight
    ) {}
}
