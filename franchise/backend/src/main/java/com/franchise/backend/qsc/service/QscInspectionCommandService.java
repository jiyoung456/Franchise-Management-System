package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.QscInspectionSaveRequest;
import com.franchise.backend.qsc.entity.QscInspectionItem;
import com.franchise.backend.qsc.entity.QscInspectionPhoto;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscInspectionItemRepository;
import com.franchise.backend.qsc.repository.QscInspectionPhotoRepository;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QscInspectionCommandService {

    private final QscMasterRepository masterRepository;
    private final QscInspectionItemRepository itemRepository;
    private final QscInspectionPhotoRepository photoRepository;

    public Long save(Long inspectorId, QscInspectionSaveRequest req) {

        // 1) master 저장
        QscMaster master = QscMaster.create(
                req.storeId(),
                req.templateId(),
                inspectorId,
                req.inspectedAt(),
                req.status(),
                req.summaryComment()
        );

        // COMPLETED면 점수 계산해서 master에 반영
        if ("COMPLETED".equalsIgnoreCase(req.status())) {
            int totalScore = calcTotalScore(req.itemScores());
            String grade = calcGrade(totalScore);
            boolean passed = totalScore >= 70;
            boolean needsReinspection = !passed;

            master.applyResult(totalScore, grade, passed, needsReinspection, OffsetDateTime.now());
        }

        QscMaster saved = masterRepository.save(master);

        // 2) items 저장
        List<QscInspectionItem> items = req.itemScores().stream()
                .map(i -> QscInspectionItem.create(saved.getInspectionId(), i.templateItemId(), i.score()))
                .toList();
        itemRepository.saveAll(items);

        // 3) photos 저장 (없을 수도 있음)
        if (req.photos() != null && !req.photos().isEmpty()) {
            List<QscInspectionPhoto> photos = req.photos().stream()
                    .map(p -> QscInspectionPhoto.create(saved.getInspectionId(), p.photoUrl(), p.photoName()))
                    .toList();
            photoRepository.saveAll(photos);
        }

        return saved.getInspectionId();
    }

    private int calcTotalScore(List<QscInspectionSaveRequest.ItemScore> itemScores) {
        if (itemScores == null || itemScores.isEmpty()) return 0;

        int sum = itemScores.stream().mapToInt(QscInspectionSaveRequest.ItemScore::score).sum();
        int max = itemScores.size() * 5;

        // 0~100 환산
        return (int) Math.round((sum / (double) max) * 100.0);
    }

    private String calcGrade(int totalScore) {
        // 네 ERD/더미 기준에 맞춰 S/A/B/C/D로
        if (totalScore >= 95) return "S";
        if (totalScore >= 90) return "A";
        if (totalScore >= 80) return "B";
        if (totalScore >= 70) return "C";
        return "D";
    }
}
