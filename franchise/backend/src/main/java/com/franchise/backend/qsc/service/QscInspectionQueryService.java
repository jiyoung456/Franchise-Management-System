package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.QscInspectionDetailResponse;
import com.franchise.backend.qsc.entity.QscInspectionItem;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscInspectionItemRepository;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QscInspectionQueryService {

    private final QscMasterRepository masterRepository;
    private final QscInspectionItemRepository itemRepository;

    public QscInspectionDetailResponse getDetail(Long inspectionId) {

        QscMaster master = masterRepository.findById(inspectionId)
                .orElseThrow(() -> new IllegalArgumentException("Inspection not found. id=" + inspectionId));

        List<QscInspectionItem> items = itemRepository.findByInspectionId(inspectionId);

        List<QscInspectionDetailResponse.ItemScore> itemScores = items.stream()
                .map(i -> new QscInspectionDetailResponse.ItemScore(i.getTemplateItemId(), i.getScore()))
                .toList();

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
                itemScores
        );
    }
}
