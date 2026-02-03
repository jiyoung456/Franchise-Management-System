package com.franchise.backend;

import com.franchise.backend.briefing.dto.*;
import com.franchise.backend.briefing.service.BriefingService;
import com.franchise.backend.qscComment.dto.CommentResponse;
import com.franchise.backend.qscComment.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BackendApplicationTests {
//
//	@Autowired
//	private BriefingService briefingService;
//
//	@Autowired
//	private CommentService commentService;
//
//	@Test
//	void contextLoads() throws Exception{
//		// =========================
//		// 1. Store List
//		// =========================
//		List<StoreDto> storeList = new ArrayList<>();
//
//		StoreDto store1 = new StoreDto();
//		store1.setStoreId(1);
//		store1.setStoreName("강남점");
//		store1.setRiskLevel("NORMAL");
//
//		StoreDto store2 = new StoreDto();
//		store2.setStoreId(2);
//		store2.setStoreName("홍대점");
//		store2.setRiskLevel("WATCHLIST");
//
//		storeList.add(store1);
//		storeList.add(store2);
//
//		// =========================
//		// 2. QSC 30 List
//		// =========================
//		List<Qsc30dDto> qsc30List = new ArrayList<>();
//
//		Qsc30dDto qsc = new Qsc30dDto();
//		qsc.setInspectionId(2);
//		qsc.setStoreId(1);
//		qsc.setStoreName("강남점");
//		qsc.setConfirmed(LocalDate.of(2026, 1, 5));
//		qsc.setTotalScore(82);
//		qsc.setComment("전반적으로 다 우수함");
//
//		qsc30List.add(qsc);
//
//		// =========================
//		// 3. No Action List
//		// =========================
//		List<NoActionDto> noActionList = new ArrayList<>();
//
//		NoActionDto noAction1 = new NoActionDto();
//		noAction1.setActionId(2);
//		noAction1.setStoreId(1);
//		noAction1.setStoreName("강남점");
//		noAction1.setTitle("주방 위생 개선");
//		noAction1.setDescription("조리대 및 냉장고 내부 정기 소독");
//
//		NoActionDto noAction2 = new NoActionDto();
//		noAction2.setActionId(3);
//		noAction2.setStoreId(2);
//		noAction2.setStoreName("홍대점");
//		noAction2.setTitle("직원 교육 미이수");
//		noAction2.setDescription("신규 직원 위생 교육");
//
//		noActionList.add(noAction1);
//		noActionList.add(noAction2);
//
//		// =========================
//		// 4. Event 48 List
//		// =========================
//		List<Event48hDto> event48List = new ArrayList<>();
//
//		Event48hDto event = new Event48hDto();
//		event.setEventId(4);
//		event.setStoreId(2);
//		event.setStoreName("홍대점");
//		event.setEventType("민원");
//		event.setSeverity("RISK");
//		event.setSummary("음식 이물질 관련 고객 민원 접수");
//
//		event48List.add(event);
//
//		// =========================
//		// 5. POS 7 List
//		// =========================
//		List<Pos7dDto> pos7List = new ArrayList<>();
//
//		Pos7dDto pos = new Pos7dDto();
//		pos.setPosPeriodAgg(11);
//		pos.setStoreId(1);
//		pos.setStoreName("강남점");
//		pos.setAov(14500);
//		pos.setSaleAmount(12_500_000L);
//		pos.setOrderCount(860);
//		pos.setCogsAmount(7_200_000L);
//		pos.setMarginAmount(5_300_000L);
//		pos.setMarginRate(0.424);
//		pos.setSaleChangeRate(-0.12);
//		pos.setOrderChangeRate(-0.08);
//		pos.setAovChangeRate(-0.04);
//
//		pos7List.add(pos);
//
//		// =========================
//		// 6. Contract End Imminent
//		// =========================
//		List<ContractEndImminentDto> contractEndList = new ArrayList<>();
//
//		ContractEndImminentDto c1 = new ContractEndImminentDto();
//		c1.setStoreId(5);
//		c1.setStoreName("신촌점");
//
//		ContractEndImminentDto c2 = new ContractEndImminentDto();
//		c2.setStoreId(6);
//		c2.setStoreName("잠실점");
//
//		contractEndList.add(c1);
//		contractEndList.add(c2);
//
//		// =========================
//		// 7. BriefingRequest 최종 생성
//		// =========================
//		BriefingRequest request = new BriefingRequest();
//		request.setUserId(1);
//		request.setAudienceRole("SUPERVISON");
//		request.setDepartment("품질관리팀");
//		request.setStoreList(storeList);
//		request.setQsc30List(qsc30List);
//		request.setNoActionList(noActionList);
//		request.setEvent48List(event48List);
//		request.setPos7List(pos7List);
//		request.setContractEndImminent(contractEndList);
//
//		// 3. 서비스 호출 (브리핑)
//		BriefingResponse response =
//				briefingService.generateBriefing(request);
//
//		// 코멘트
////		CommentResponse response =
////				commentService.generateCommentAnalyze(request);
//
//		// 4. 결과 검증 (브리핑)
//		assertThat(response).isNotNull();
//
//		assertThat(response.getTargetDate()).isNotNull();
//
//		assertThat(response.getTargetDate().getUserId()).isNotNull();
//		assertThat(response.getTargetDate().getAudienceRole()).isNotNull();
//		assertThat(response.getTargetDate().getDepartment()).isNotNull();
//
//		assertThat(response.getTargetDate().getStoreList()).isNotNull();
//		assertThat(response.getTargetDate().getStoreList())
//				.isNotEmpty()
//				.allSatisfy(store -> {
//					assertThat(store.getStoreId()).isNotNull();
//					assertThat(store.getStoreName()).isNotNull();
//					assertThat(store.getRiskLevel()).isNotNull();
//				});
//
//
//		assertThat(response.getTargetDate().getQsc30List()).isNotNull();
//		assertThat(response.getTargetDate().getQsc30List())
//				.isNotEmpty()
//				.allSatisfy(qsc_re -> {
//					assertThat(qsc_re.getInspectionId()).isNotNull();
//					assertThat(qsc_re.getStoreId()).isNotNull();
//					assertThat(qsc_re.getStoreName()).isNotNull();
//					assertThat(qsc_re.getConfirmed()).isNotNull();
//					assertThat(qsc_re.getTotalScore()).isNotNull();
//					assertThat(qsc_re.getComment()).isNotNull();
//				});
//
//		assertThat(response.getTargetDate().getNoAction()).isNotNull();
//		assertThat(response.getTargetDate().getNoAction())
//				.isNotEmpty()
//				.allSatisfy(noAction -> {
//					assertThat(noAction.getActionId()).isNotNull();
//					assertThat(noAction.getStoreId()).isNotNull();
//					assertThat(noAction.getStoreName()).isNotNull();
//					assertThat(noAction.getTitle()).isNotNull();
//					assertThat(noAction.getDescription()).isNotNull();
//				});
//
//		assertThat(response.getTargetDate().getEvent48List()).isNotNull();
//		assertThat(response.getTargetDate().getEvent48List())
//				.isNotEmpty()
//				.allSatisfy(event_re -> {
//					assertThat(event_re.getEventId()).isNotNull();
//					assertThat(event_re.getStoreId()).isNotNull();
//					assertThat(event_re.getStoreName()).isNotNull();
//					assertThat(event_re.getEventType()).isNotNull();
//					assertThat(event_re.getSeverity()).isNotNull();
//					assertThat(event_re.getSummary()).isNotNull();
//				});
//
//		assertThat(response.getTargetDate().getPos7List()).isNotNull();
//		assertThat(response.getTargetDate().getPos7List())
//				.isNotEmpty()
//				.allSatisfy(pos_re -> {
//					assertThat(pos_re.getStoreId()).isNotNull();
//					assertThat(pos_re.getStoreName()).isNotNull();
//					assertThat(pos_re.getAov()).isNotNull();
//					assertThat(pos_re.getSaleAmount()).isNotNull();
//					assertThat(pos_re.getOrderCount()).isNotNull();
//					assertThat(pos_re.getCogsAmount()).isNotNull();
//					assertThat(pos_re.getMarginAmount()).isNotNull();
//					assertThat(pos_re.getMarginRate()).isNotNull();
//				});
//
//
//		assertThat(response.getTargetDate().getContractEndImminent()).isNotNull();
//		assertThat(response.getTargetDate().getContractEndImminent())
//				.isNotEmpty()
//				.allSatisfy(contract -> {
//					assertThat(contract.getStoreId()).isNotNull();
//					assertThat(contract.getStoreName()).isNotNull();
//				});
//
//		assertThat(response.getFocusPointJson()).isNotNull();
//		assertThat(response.getFocusPointJson())
//				.isNotEmpty()
//				.allSatisfy(fp -> {
//					assertThat(fp.getStoreId()).isNotNull();
//					assertThat(fp.getStoreName()).isNotNull();
//					assertThat(fp.getSeverity()).isNotNull();
//					assertThat(fp.getReason()).isNotNull();
//				});
//
//		assertThat(response.getFocusPointJsonChecked()).isNotNull();
//		assertThat(response.getFocusPointJsonChecked())
//				.isNotEmpty()
//				.allSatisfy(fpc -> {
//					assertThat(fpc.getCheckId()).isNotNull();
//					assertThat(fpc.getCheck()).isNotNull();
//					assertThat(fpc.getToDo()).isNotNull();
//					assertThat(fpc.getPriority()).isNotNull();
//				});
//
//		assertThat(response.getTopStroeJson()).isNotNull();
//		assertThat(response.getTopStroeJson().getStoreCnt()).isNotNull();
//		assertThat(response.getTopStroeJson().getIssueCnt()).isNotNull();
//		assertThat(response.getTopStroeJson().getSeverityCnt()).isNotNull();
//		assertThat(response.getTopStroeJson().getNoActionCnt()).isNotNull();
//
//		assertThat(response.getSummaryText()).isNotBlank();
//		assertThat(response.getGenerateAt()).isNotNull();
//
//
//	}

}
