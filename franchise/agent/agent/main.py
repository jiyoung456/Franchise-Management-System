from fastapi import FastAPI
from agent.api.agent_controller import router as test_router
from contextlib import asynccontextmanager
from agent.config.agent_graph import build_all_graphs
from agent.config.api_config import get_gemini_api

@asynccontextmanager
async def lifespan(app: FastAPI):

    get_gemini_api()

    app.state.agent_graphs = build_all_graphs()
    yield
    # 종료 시 정리 필요하면 여기서 처리
    print("Server shutdown")


app = FastAPI(lifespan=lifespan)

app.include_router(test_router)