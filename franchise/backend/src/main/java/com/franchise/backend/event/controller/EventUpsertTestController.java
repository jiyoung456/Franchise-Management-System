package com.franchise.backend.event.controller;

import com.franchise.backend.event.entity.EventRule;
import com.franchise.backend.event.service.EventUpsertService;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import com.franchise.backend.event.repository.EventRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test/events")
public class EventUpsertTestController {

    private final EventUpsertService eventUpsertService;
    private final StoreRepository storeRepository;
    private final EventRuleRepository eventRuleRepository;
    private final UserRepository userRepository;

    @PostMapping("/upsert")
    public ResponseEntity<?> upsert(@RequestBody Req req) {

        Store store = storeRepository.findById(req.storeId())
                .orElseThrow(() -> new IllegalArgumentException("store not found"));

        EventRule rule = eventRuleRepository.findById(req.ruleId())
                .orElseThrow(() -> new IllegalArgumentException("rule not found"));

        User supervisor = store.getSupervisor(); // 점포 담당 SV

        var result = eventUpsertService.upsertEventAndNotifyIfNew(
                store,
                rule,
                supervisor,
                req.eventType(),
                req.severity(),
                req.summary(),
                req.relatedEntityType(),
                req.relatedEntityId(),
                OffsetDateTime.now()
        );

        return ResponseEntity.ok(result);
    }

    public record Req(
            Long storeId,
            Long ruleId,
            String eventType,
            String severity,
            String summary,
            String relatedEntityType,
            Long relatedEntityId
    ) {}
    //
}
