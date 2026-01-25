package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.QscResponse;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QscQueryService {

    private final QscMasterRepository qscMasterRepository;

    // 점포별 QSC 목록(최신순, COMPLETED만)
    @Transactional(readOnly = true)
    public List<QscResponse> getStoreQscList(Long storeId, int limit) {

        int safeLimit = Math.max(1, Math.min(limit, 100));

        // repo는 List를 내리므로, limit 적용은 Pageable로 하는 방식이 깔끔하지만
        // 지금은 간단히: 전체 정렬 리스트에서 stream limit
        List<QscMaster> list = qscMasterRepository.findCompletedListByStoreId(storeId);

        return list.stream()
                .limit(safeLimit)
                .map(this::toResponse)
                .toList();
    }

    // 점포별 최신 QSC 1건
    @Transactional(readOnly = true)
    public QscResponse getLatestStoreQsc(Long storeId) {

        List<QscMaster> list = qscMasterRepository.findCompletedListByStoreId(storeId);
        if (list.isEmpty()) return null;

        return toResponse(list.get(0));
    }

    private QscResponse toResponse(QscMaster q) {
        return new QscResponse(
                q.getInspectionId(),
                q.getStoreId(),
                q.getTemplateId(),
                q.getInspectorId(),
                q.getInspectedAt(),
                q.getStatus(),
                q.getTotalScore(),
                q.getGrade(),
                q.getIsPassed(),
                q.getNeedsReinspection(),
                q.getSummaryComment(),
                q.getConfirmedAt()
        );
    }
}
