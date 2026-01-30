package com.franchise.backend.qsc.dto;

public record QscStoreSearchResponse(
        Long storeId,
        String storeName,
        String regionCode
) {}
