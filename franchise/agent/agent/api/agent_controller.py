from fastapi import APIRouter, Request
from agent.dto.agent_dto import BriefingRequest, BriefingResponse, CommentRequest, CommentResponse
from agent.mapper.state_to_dto import build_comment_response, build_briefing_response
from agent.config.exception import execute_agent

router = APIRouter()


@router.post("/agent/briefing")
def run_briefing_agnet(request : Request, prompt: BriefingRequest) -> BriefingResponse:
    result = execute_agent(
        request=request,
        agent_name="briefing",
        payload={
        "user_id": prompt.user_id,
        "audience_role": prompt.audience_role,
        "department": prompt.department,
        "store_list": prompt.store_list,
        "qsc_30_list": prompt.qsc_30_list,
        "no_action": prompt.no_action,
        "event_48_list": prompt.event_48_list,
        "pos_7_list": prompt.pos_7_list,
        "contract_end_imminent": prompt.contract_end_imminent
        }
    )
    return build_briefing_response(result)


@router.post("/agent/comment")
def analyze_comment(request: Request, prompt: CommentRequest) -> CommentResponse:
    result = execute_agent(
        request=request,
        agent_name="comment",
        payload={
        "inspection_id": prompt.inspection_id,
        "summary_comment": prompt.summary_comment,
        }
    )
    return build_comment_response(result)