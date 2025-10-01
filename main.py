import logging 
#fastapi
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
#dotenv 
from dotenv import load_dotenv
#pydantic
from pydantic import BaseModel
#langchain
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import create_tool_calling_agent, AgentExecutor
#tools
from tools import search_tool, wiki_tool 

load_dotenv()
logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="Research Agent API", version="0.1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] while debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    query: str

class ResearchResponse(BaseModel):
    topic: str
    summary: str
    sources: list[str]
    tool_used: str
    reply: str

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
)

parser = PydanticOutputParser(pydantic_object=ResearchResponse)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", 
            """
            You are a research assistant that will help generate a research paper.
            Answer the user query and use neccessary tools.
            Wrap the output in this format and provide no other text\n{format_instructions}
            """,
        ),
        ("placeholder", "{chat_history}"),
        ("human", "{query}"),
        ("placeholder", "{agent_scratchpad}"),
    ]
).partial(format_instructions=parser.get_format_instructions())

tools = [search_tool, wiki_tool] #save_tool
agent = create_tool_calling_agent(
    llm=llm,
    prompt=prompt,
    tools=tools, 
)

agent_executor = AgentExecutor(agent=agent, tools = tools, verbose=True)


# Route
@app.get("/", tags=["root"])
async def read_root():
    return {"status": "ok", "message": "Research Agent API running"}

# --- safer run_research endpoint ---
@app.post("/research", response_model=ResearchResponse)
async def run_research(req: ResearchRequest):
    try:
        raw_response = await run_in_threadpool(lambda: agent_executor.invoke({"query": req.query}))
    except Exception as e:
        logger.exception("Agent invocation failed")
        raise HTTPException(status_code=500, detail=f"Agent invocation failed: {e}")

    # defensively obtain the textual output we expect the parser to consume
    output_text = None
    try:
        if isinstance(raw_response, dict) and "output" in raw_response:
            output_text = raw_response.get("output")
        elif hasattr(raw_response, "output"):
            output_text = getattr(raw_response, "output")
        else:
            # fallback: try to stringify the whole response
            output_text = str(raw_response)
    except Exception:
        # keep going; output_text may still be None or a string
        output_text = str(raw_response)

    if not output_text:
        # dump raw_response to a file for debugging (non-blocking, small)
        try:
            import json, datetime
            ts = datetime.datetime.utcnow().isoformat().replace(":", "-")
            fname = f"agent_debug_no_output_{ts}.json"
            with open(fname, "w", encoding="utf-8") as f:
                json.dump({"raw_response": repr(raw_response)}, f, ensure_ascii=False, indent=2)
            logger.error("Agent returned no 'output' field; raw_response written to %s", fname)
        except Exception:
            logger.exception("Failed to persist raw_response for debugging")
        raise HTTPException(status_code=502, detail="Agent returned no parseable output. Check server logs.")

    # now try parsing; handle parser errors explicitly
    try:
        structured = parser.parse(output_text)
    except Exception as e:
        # save raw output for debugging
        try:
            import json, datetime
            ts = datetime.datetime.utcnow().isoformat().replace(":", "-")
            fname = f"agent_parse_error_{ts}.json"
            with open(fname, "w", encoding="utf-8") as f:
                json.dump({"query": req.query, "output_text": output_text}, f, ensure_ascii=False, indent=2)
            logger.error("Parsing failed; output written to %s", fname)
        except Exception:
            logger.exception("Failed saving parse error debug file")

        logger.exception("Parser failed to parse output_text")
        raise HTTPException(status_code=500, detail=f"Failed to parse agent output: {e}. Raw output saved for debugging.")

    # structured is now guaranteed to exist

    return ResearchResponse(**structured.dict())

