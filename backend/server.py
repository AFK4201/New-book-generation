from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from mistralai import Mistral

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Mistral AI client
mistral_client = Mistral(api_key=os.environ['MISTRAL_API_KEY'])

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class StoryRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class Story(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    prompt: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StoryCreate(BaseModel):
    title: str
    content: str
    prompt: str

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    messages: List[ChatMessage]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Mistral Story Maker API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Mistral AI routes
@api_router.post("/generate-story")
async def generate_story(request: StoryRequest):
    try:
        # Use Mistral 3 Large model
        response = await mistral_client.chat.complete_async(
            model="mistral-large-latest",
            messages=[
                {
                    "role": "user",
                    "content": f"Write a creative story based on this prompt: {request.prompt}"
                }
            ],
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        generated_content = response.choices[0].message.content
        
        return {
            "success": True,
            "story": generated_content,
            "prompt": request.prompt
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

@api_router.post("/complete-story")
async def complete_story(request: StoryRequest):
    try:
        response = await mistral_client.chat.complete_async(
            model="mistral-large-latest",
            messages=[
                {
                    "role": "user", 
                    "content": f"Continue this story in a creative way: {request.prompt}"
                }
            ],
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        completion = response.choices[0].message.content
        
        return {
            "success": True,
            "completion": completion,
            "original": request.prompt
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Story completion failed: {str(e)}")

@api_router.post("/chat")
async def chat_with_mistral(request: ChatRequest):
    try:
        # Convert our ChatMessage objects to the format Mistral expects
        mistral_messages = [
            {"role": msg.role, "content": msg.content} for msg in request.messages
        ]
        
        response = await mistral_client.chat.complete_async(
            model="mistral-large-latest",
            messages=mistral_messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        assistant_response = response.choices[0].message.content
        
        return {
            "success": True,
            "response": assistant_response
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# Story management routes
@api_router.post("/stories", response_model=Story)
async def save_story(story: StoryCreate):
    story_obj = Story(**story.dict())
    await db.stories.insert_one(story_obj.dict())
    return story_obj

@api_router.get("/stories", response_model=List[Story])
async def get_stories():
    stories = await db.stories.find().sort("created_at", -1).to_list(100)
    return [Story(**story) for story in stories]

@api_router.get("/stories/{story_id}", response_model=Story)
async def get_story(story_id: str):
    story = await db.stories.find_one({"id": story_id})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return Story(**story)

@api_router.delete("/stories/{story_id}")
async def delete_story(story_id: str):
    result = await db.stories.delete_one({"id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"success": True, "message": "Story deleted"}

# Chat session management
@api_router.post("/chat-sessions", response_model=ChatSession)
async def create_chat_session():
    session = ChatSession(messages=[])
    await db.chat_sessions.insert_one(session.dict())
    return session

@api_router.get("/chat-sessions", response_model=List[ChatSession])
async def get_chat_sessions():
    sessions = await db.chat_sessions.find().sort("updated_at", -1).to_list(50)
    return [ChatSession(**session) for session in sessions]

@api_router.get("/chat-sessions/{session_id}", response_model=ChatSession)
async def get_chat_session(session_id: str):
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return ChatSession(**session)

@api_router.put("/chat-sessions/{session_id}")
async def update_chat_session(session_id: str, messages: List[ChatMessage]):
    result = await db.chat_sessions.update_one(
        {"id": session_id},
        {
            "$set": {
                "messages": [msg.dict() for msg in messages],
                "updated_at": datetime.utcnow()
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return {"success": True, "message": "Chat session updated"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()