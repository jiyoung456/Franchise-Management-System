from fastapi import Request, HTTPException
from typing import Dict, Any


def execute_agent(
    request: Request,
    agent_name: str,
    payload: Dict[str, Any],
    result_key: str | None = None
):
    # 1. 서버 상태 검증
    graphs = getattr(request.app.state, "agent_graphs", None)
    if graphs is None:
        raise HTTPException(
            status_code=500,
            detail="agent graphs not initialized"
        )

    # 2. 에이전트 존재 여부 검증
    if agent_name not in graphs:
        raise HTTPException(
            status_code=404,
            detail=f"{agent_name} agent not found"
        )

    try:
        # 3. 에이전트 실행
        result = graphs[agent_name].invoke(payload)

    except KeyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"agent state error: {str(e)}"
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"invalid input value: {str(e)}"
        )

    # 4. 결과 키 검증 (선택)
    if result_key:
        if result_key not in result:
            raise HTTPException(
                status_code=500,
                detail="invalid agent response format"
            )
        return result[result_key]

    return result