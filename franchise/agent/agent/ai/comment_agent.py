from datetime import datetime
from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from agent.config.api_config import get_gemini_model, get_model_name, get_prompt_version
from agent.utils.utils import extract_json

# 상태 관리 (State)
class CommentState(TypedDict): 
    # 입력 
    inspection_id: int 
    summary_comment: str 

    # 출력
    summary: str 
    topic_json: List[str] 
    keyword_json: List[str] 
    analyzed_at : datetime 
    model_name : str 
    prompt_version : str

# 에이전트 노드 (LLM 호출)
def run_comment_llm(state: CommentState) -> CommentState:
    state["analyzed_at"] = datetime.now()
    state["model_name"] = get_model_name()
    state["prompt_version"] = get_prompt_version()
    prompt = f'''
    당신은 프랜차이즈 QSC 점검 결과 코멘트 분석가입니다. 아래 SV 코멘트를 분석해서 JSON으로 응답하세요.

    [입력]
    점검 아이디: {state["inspection_id"]}
    코멘트: {state["summary_comment"]}

    [출력 규칙]
    - summary는 문자열(string)이며 한 문장으로 작성
    - topic_json은 문자열 배열(array of string)만 허용
    - keyword_json은 문자열 배열(array of string)만 허용
    - null, 숫자, 중첩 객체는 허용하지 않음
    - 추가 필드는 절대 포함하지 않음

    [출력 포맷(JSON)]
    {{
        "summary": "1줄 요약",
        "topic_json": ["품질", "서비스", "위생", "안전"],
        "keyword_json": ["키워드1", "키워드2"]
    }}
    '''
    try:
        llm = get_gemini_model()
        response = llm.generate_content(prompt)
        parsed = extract_json(response.text)

        state["summary"] = parsed["summary"]
        state["topic_json"] = parsed["topic_json"]
        state["keyword_json"] = parsed["keyword_json"]
    except Exception as e:
        raise RuntimeError(f"LLM CALL ERROR: {e}")
        
    return state


# LangGraph 그래프 구성
def build_comment_agent() :
    graph = StateGraph(CommentState)
    graph.add_node("run_comment_llm", run_comment_llm)
    graph.set_entry_point("run_comment_llm")
    graph.add_edge("run_comment_llm", END)
    return graph.compile()