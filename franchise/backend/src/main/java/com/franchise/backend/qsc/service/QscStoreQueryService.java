package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.QscStoreSearchResponse;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QscStoreQueryService {

    private final StoreRepository storeRepository;

    public List<QscStoreSearchResponse> getStoresForSupervisor(Long supervisorId) {
        return storeRepository.findBySupervisor_Id(supervisorId).stream()
                .map(s -> new QscStoreSearchResponse(
                        s.getId(),
                        s.getStoreName(),
                        s.getRegionCode()
                ))
                .toList();
    }
}
