from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
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

# Import our models and agents
from models import *
from orchestrator import MasterOrchestrator

# Legacy models for backward compatibility
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Mistral AI client
mistral_client = Mistral(api_key=os.environ['MISTRAL_API_KEY'])

# Master Orchestrator
orchestrator = MasterOrchestrator(mistral_client, db)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Basic API Routes
@api_router.get("/")
async def root():
    return {"message": "Mistral Advanced Story Generator API"}

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

# Story Project Management Routes
@api_router.post("/projects", response_model=StoryProject)
async def create_story_project(project_data: dict):
    """Create a new story project"""
    try:
        # Parse the project data
        project = StoryProject(
            title=project_data["title"],
            target_chapters=project_data.get("target_chapters", 10),
            target_words_per_chapter=project_data.get("target_words_per_chapter", 2000)
        )
        
        # Parse worldbuilding if provided
        if "worldbuilding" in project_data:
            project.worldbuilding = WorldbuildingContext(**project_data["worldbuilding"])
        
        # Parse characters if provided
        if "characters" in project_data:
            project.characters = [Character(**char_data) for char_data in project_data["characters"]]
        
        # Parse plot utility if provided
        if "plot_utility" in project_data:
            project.plot_utility = PlotUtility(**project_data["plot_utility"])
        
        # Save to database
        await db.story_projects.insert_one(project.dict())
        
        return project
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating project: {str(e)}")

@api_router.get("/projects", response_model=List[StoryProject])
async def get_story_projects():
    """Get all story projects"""
    projects = await db.story_projects.find().sort("created_at", -1).to_list(100)
    return [StoryProject(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=StoryProject)
async def get_story_project(project_id: str):
    """Get a specific story project"""
    project = await db.story_projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return StoryProject(**project)

@api_router.put("/projects/{project_id}", response_model=StoryProject)
async def update_story_project(project_id: str, project_data: dict):
    """Update a story project"""
    try:
        # Get existing project
        existing_project = await db.story_projects.find_one({"id": project_id})
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update fields
        update_data = {
            "updated_at": datetime.utcnow()
        }
        
        if "title" in project_data:
            update_data["title"] = project_data["title"]
        if "target_chapters" in project_data:
            update_data["target_chapters"] = project_data["target_chapters"]
        if "target_words_per_chapter" in project_data:
            update_data["target_words_per_chapter"] = project_data["target_words_per_chapter"]
        if "worldbuilding" in project_data:
            update_data["worldbuilding"] = project_data["worldbuilding"]
        if "characters" in project_data:
            update_data["characters"] = [char for char in project_data["characters"]]
        if "plot_utility" in project_data:
            update_data["plot_utility"] = project_data["plot_utility"]
        
        await db.story_projects.update_one(
            {"id": project_id},
            {"$set": update_data}
        )
        
        # Return updated project
        updated_project = await db.story_projects.find_one({"id": project_id})
        return StoryProject(**updated_project)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating project: {str(e)}")

@api_router.delete("/projects/{project_id}")
async def delete_story_project(project_id: str):
    """Delete a story project"""
    result = await db.story_projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Also delete related data
    await db.agent_progress.delete_many({"project_id": project_id})
    
    return {"success": True, "message": "Project deleted"}

# Story Generation Routes
@api_router.post("/projects/{project_id}/generate")
async def start_story_generation(project_id: str, background_tasks: BackgroundTasks):
    """Start the story generation process"""
    try:
        # Check if project exists
        project = await db.story_projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if generation is already in progress
        if project.get("current_status") == "running":
            raise HTTPException(status_code=400, detail="Generation already in progress")
        
        # Start generation in background
        background_tasks.add_task(
            orchestrator.orchestrate_story_generation, 
            project_id
        )
        
        return {
            "success": True,
            "message": "Story generation started",
            "project_id": project_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting generation: {str(e)}")

@api_router.get("/projects/{project_id}/progress")
async def get_generation_progress(project_id: str):
    """Get the progress of story generation"""
    try:
        progress_data = await orchestrator.get_project_progress(project_id)
        return progress_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting progress: {str(e)}")

@api_router.get("/projects/{project_id}/preview")
async def get_story_preview(project_id: str):
    """Get a preview of the generated story"""
    try:
        project = await db.story_projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        chapters = project.get("chapters", [])
        if not chapters:
            raise HTTPException(status_code=404, detail="No chapters generated yet")
        
        # Return preview data
        return {
            "project_id": project_id,
            "title": project["title"],
            "total_chapters": len(chapters),
            "total_words": project.get("total_word_count", 0),
            "chapters": [
                {
                    "chapter_number": ch["chapter_number"],
                    "title": ch["title"],
                    "word_count": ch["word_count"],
                    "preview": ch["content"][:300] + "..." if len(ch["content"]) > 300 else ch["content"]
                }
                for ch in chapters
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting preview: {str(e)}")

@api_router.get("/projects/{project_id}/download")
async def download_story_document(project_id: str):
    """Download the complete story as a KDP-ready Word document"""
    try:
        project = await db.story_projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project.get("current_status") != "completed":
            raise HTTPException(status_code=400, detail="Story generation not completed")
        
        # Check if document exists
        title = project["title"]
        filename = f"{title.replace(' ', '_').replace('/', '_')}_{project_id}.docx"
        filepath = f"/app/backend/generated_books/{filename}"
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Document not found. Please regenerate the story.")
        
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading document: {str(e)}")

# Legacy Chat and Story Generation Routes (for backward compatibility)
@api_router.post("/generate-story")
async def generate_story(request: StoryRequest):
    try:
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

# Legacy Story Management Routes
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

# Create required directories
os.makedirs("/app/backend/generated_books", exist_ok=True)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()