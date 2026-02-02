from agent.ai.briefing_agent import build_briefing_agent
from agent.ai.comment_agent import build_comment_agent

def build_all_graphs():
    return {
    "briefing": build_briefing_agent(),
    "comment" : build_comment_agent()
    }