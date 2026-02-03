from typing import Dict, Any

def build_briefing_response(state: Dict[str, Any]) -> Dict[str, Any]:

    response = {
        "focus_point_json": state["focus_point_json"],
        "focus_point_json_checked": state["focus_point_json_checked"],
        "top_stroe_json": state["top_store_json"],
        "summary_text": state["summary"],
        "generate_at": state["generate_at"]
    }

    return response

def build_comment_response(state: Dict[str, Any]) -> Dict[str, Any]:
    raw_response_json = {
        "summary": state["summary"],
        "topic_json": state["topic_json"],
        "keyword_json": state["keyword_json"]
    }

    response = {
        "source_text": state["summary_comment"],
        "topic_json": state["topic_json"],
        "keyword_json": state["keyword_json"],
        "summary": state["summary"],
        "raw_response_json": raw_response_json,
        "analyzed_at": state["analyzed_at"],
        "model_name": state["model_name"],
        "prompt_version": state["prompt_version"]
    }

    return response
