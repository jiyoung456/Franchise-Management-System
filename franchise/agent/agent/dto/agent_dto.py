from pydantic import BaseModel
from typing import Dict, List, Any
from datetime import datetime


class BriefingRequest(BaseModel):
    user_id: int
    audience_role: str
    department: str

    store_list: List[Dict[str, Any]]
    qsc_30_list: List[Dict[str, Any]]
    no_action: List[Dict[str, Any]]
    event_48_list: List[Dict[str, Any]]
    pos_7_list: List[Dict[str, Any]]
    contract_end_imminent: List[Dict[str, Any]]

class BriefingResponse(BaseModel): 
    focus_point_json : List[Dict] 
    focus_point_json_checked : List[Dict] 
    top_stroe_json : Dict[str, int] 
    summary_text : str 
    generate_at : datetime

class CommentRequest(BaseModel):
    inspection_id: int
    summary_comment: str

class CommentResponse(BaseModel) : 
    source_text : str 
    topic_json : List[str] 
    keyword_json : List[str] 
    summary : str 
    raw_response_json : Dict[str, Any] 
    analyzed_at : datetime 
    model_name : str 
    prompt_version : str