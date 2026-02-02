from datetime import datetime
from langgraph.graph import StateGraph, END
from typing import Dict, List, TypedDict, Any
from agent.config.api_config import get_gemini_model
from agent.utils.utils import extract_json


# 상태 관리 (State)
class AgentState(TypedDict):
    user_id: int
    role: str
    department: str

    store_list: List[Dict[str, Any]]
    qsc_30_list: List[Dict[str, Any]]
    no_action: List[Dict[str, Any]]
    event_48_list: List[Dict[str, Any]]
    pos_7_list: List[Dict[str, Any]]
    contract_end_imminent: List[Dict[str, Any]]

    top_store_json: Dict[str, int]
    focus_point_json: List[Dict[str, Any]]
    focus_point_json_checked: List[Dict[str, Any]]

    summary: str

    generate_at: datetime


# 에이전트 노드 (LLM 호출)
def run_briefing_llm(state: AgentState) -> AgentState:
    state["generate_at"] = datetime.now()
    prompt = f"""
너는 프랜차이즈 본사의 가맹점 관리 AI다.

아래 입력 데이터를 종합 분석하여
다음 4가지를 한 번에 수행하라.

1. 확인이 필요한 점포 목록을 선별한다
   - severity: 확인 | 주의 | 위험
   - 핵심 원인을 요약한다

2. 전체 점포를 기준으로 해야 할 checklist를 생성한다
   - to_do는 10어절 이내
   - priority는 LOW, MEDIUM, HIGH
   - 세 priority는 최소 1개씩 포함

3. 점포 현황을 집계한다
   - store_cnt
   - issue_cnt
   - severity_cnt (RISK 이상)
   - no_action_cnt

4. 가맹점 관리자가 바로 이해할 수 있는 짧은 요약 문단을 작성한다

입력 데이터:
user_id: {state["user_id"]}
role: {state["role"]}
department: {state["department"]}

store_list: {state["store_list"]}
qsc_30_list: {state["qsc_30_list"]}
no_action: {state["no_action"]}
event_48_list: {state["event_48_list"]}
pos_7_list: {state["pos_7_list"]}
contract_end_imminent: {state["contract_end_imminent"]}

출력은 반드시 아래 JSON 형식 하나만 반환해라.
설명 문장, 코드블럭, 주석은 절대 포함하지 마라.

출력 포맷:
{{
  "top_store_json": {{
    "store_cnt": 정수,
    "issue_cnt": 정수,
    "severity_cnt": 정수,
    "no_action_cnt": 정수
  }},
  "focus_point_json": [
    {{
      "store_id": 정수,
      "store_name": 문자열,
      "severity": "확인 | 주의 | 위험",
      "reason": 문자열
    }}
  ],
  "focus_point_json_checked": [
    {{
      "check_id": 정수,
      "check": false,
      "to_do": 문자열,
      "priority": "LOW | MEDIUM | HIGH"
    }}
  ],
  "summary": 문자열
}}
"""

    try:
        llm = get_gemini_model()
        response = llm.generate_content(prompt)
        result = extract_json(response.text)

        state["top_store_json"] = result["top_store_json"]
        state["focus_point_json"] = result["focus_point_json"]
        state["focus_point_json_checked"] = result["focus_point_json_checked"]
        state["summary"] = result["summary"]

    except Exception as e:
        raise RuntimeError(f"LLM CALL ERROR: {e}")

    return state



# LangGraph 그래프 구성
def build_briefing_agent() :
    graph = StateGraph(AgentState)
    graph.add_node("run_briefing_llm", run_briefing_llm)
    graph.set_entry_point("run_briefing_llm")
    graph.add_edge("run_briefing_llm", END)
    return graph.compile()