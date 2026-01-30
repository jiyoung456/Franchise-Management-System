package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.storestatus.SvStoreQscStatusResponse;
import com.franchise.backend.qsc.repository.QscStoreStatusProjection;
import com.franchise.backend.qsc.repository.QscStoreStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SvStoreQscStatusService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final QscStoreStatusRepository qscStoreStatusRepository;

    public SvStoreQscStatusResponse getStoreQscStatus(Long svId, String month, String keyword) {
        YearMonth ym = parseYearMonth(month);
        Range range = monthRangeKst(ym);

        String normalizedKeyword = normalizeKeyword(keyword);

        List<QscStoreStatusProjection.Row> rows =
                qscStoreStatusRepository.fetchStoreStatusRows(
                        svId,
                        range.startInclusive,
                        range.endExclusive,
                        normalizedKeyword
                );

        List<SvStoreQscStatusResponse.Item> items = rows.stream()
                .map(r -> {
                    long cnt = r.getThisMonthInspectionCount() == null ? 0L : r.getThisMonthInspectionCount();
                    boolean under = cnt < 2;
                    return SvStoreQscStatusResponse.Item.builder()
                            .storeId(r.getStoreId())
                            .storeName(r.getStoreName())
                            .regionCode(r.getRegionCode())
                            .latestGrade(r.getLatestGrade())
                            .latestConfirmedAt(r.getLatestConfirmedAt())
                            .thisMonthInspectionCount(cnt)
                            .underInspected(under)
                            .build();
                })
                .toList();

        long total = items.size();
        long underCnt = items.stream().filter(SvStoreQscStatusResponse.Item::getUnderInspected).count();

        return SvStoreQscStatusResponse.builder()
                .month(ym.format(YM_FMT))
                .totalStoreCount(total)
                .underInspectedCount(underCnt)
                .items(items)
                .build();
    }

    private static YearMonth parseYearMonth(String ym) {
        try {
            return YearMonth.parse(ym, YM_FMT);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid month format. Expected yyyy-MM, got: " + ym);
        }
    }

    private static Range monthRangeKst(YearMonth ym) {
        ZonedDateTime start = ym.atDay(1).atStartOfDay(KST);
        ZonedDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay(KST);
        return new Range(start.toOffsetDateTime(), end.toOffsetDateTime());
    }

    private static String normalizeKeyword(String keyword) {
        if (keyword == null) return null;
        String k = keyword.trim();
        return k.isEmpty() ? null : k;
    }

    private record Range(OffsetDateTime startInclusive, OffsetDateTime endExclusive) {}
}
