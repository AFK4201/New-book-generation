import asyncio
import logging
from typing import Dict, Any
from mistralai import Mistral
from agents import *
from models import *
from document_formatter import DocumentFormatter

logger = logging.getLogger(__name__)

class MasterOrchestrator:
    def __init__(self, mistral_client: Mistral, db):
        self.mistral_client = mistral_client
        self.db = db
        
        # Initialize all agents
        self.worldbuilding_agent = WorldbuildingAgent(mistral_client, db)
        self.character_agent = CharacterAgent(mistral_client, db)
        self.plot_agent = PlotAgent(mistral_client, db)
        self.story_generator_agent = StoryGeneratorAgent(mistral_client, db)
        self.sequential_checker_agent = SequentialCheckerAgent(mistral_client, db)
        self.document_formatter = DocumentFormatter()
        
    async def orchestrate_story_generation(self, project_id: str) -> Dict[str, Any]:
        """Main orchestration method that coordinates all agents"""
        try:
            # Get project data
            project_doc = await self.db.story_projects.find_one({"id": project_id})
            if not project_doc:
                raise ValueError(f"Project {project_id} not found")
            
            project = StoryProject(**project_doc)
            
            # Initialize agent progress tracking
            await self._initialize_agent_tracking(project_id)
            
            logger.info(f"Starting story generation orchestration for project {project_id}")
            
            # Phase 1: Worldbuilding Analysis
            logger.info("Phase 1: Worldbuilding Analysis")
            world_context = await self.worldbuilding_agent.process(
                project_id, project.worldbuilding
            )
            
            # Phase 2: Character Development
            logger.info("Phase 2: Character Development")
            character_context = await self.character_agent.process(
                project_id, project.characters, world_context
            )
            
            # Phase 3: Plot Structure Creation
            logger.info("Phase 3: Plot Structure Creation")
            plot_context = await self.plot_agent.process(
                project_id, project.plot_utility, world_context, 
                character_context, project.target_chapters
            )
            
            # Phase 4: Story Generation with Sequential Checking
            logger.info("Phase 4: Story Generation with Sequential Checking")
            chapters = await self._generate_and_check_story(
                project_id, world_context, character_context, 
                plot_context, project.target_words_per_chapter
            )
            
            # Phase 5: Document Formatting
            logger.info("Phase 5: Document Formatting")
            document_path = await self._format_final_document(
                project_id, project.title, chapters
            )
            
            # Final update
            total_words = sum(chapter.word_count for chapter in chapters)
            await self.db.story_projects.update_one(
                {"id": project_id},
                {
                    "$set": {
                        "current_status": AgentStatusEnum.completed.value,
                        "progress_percentage": 100.0,
                        "total_word_count": total_words,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Story generation completed for project {project_id}")
            
            return {
                "success": True,
                "project_id": project_id,
                "total_chapters": len(chapters),
                "total_words": total_words,
                "document_path": document_path,
                "world_context": world_context,
                "character_context": character_context,
                "plot_context": plot_context
            }
            
        except Exception as e:
            logger.error(f"Orchestration error for project {project_id}: {str(e)}")
            
            # Update project status to error
            await self.db.story_projects.update_one(
                {"id": project_id},
                {
                    "$set": {
                        "current_status": AgentStatusEnum.error.value,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            raise
    
    async def _initialize_agent_tracking(self, project_id: str):
        """Initialize progress tracking for all agents"""
        agents = [
            "WorldbuildingAgent",
            "CharacterAgent", 
            "PlotAgent",
            "StoryGeneratorAgent",
            "SequentialCheckerAgent",
            "DocumentFormatter"
        ]
        
        for agent_name in agents:
            await self.db.agent_progress.update_one(
                {"project_id": project_id, "agent_name": agent_name},
                {
                    "$set": {
                        "status": AgentStatusEnum.pending.value,
                        "progress_percentage": 0.0,
                        "current_task": None,
                        "error_message": None,
                        "created_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
    
    async def _generate_and_check_story(self, project_id: str, world_context: Dict, 
                                       character_context: Dict, plot_context: Dict, 
                                       target_words: int) -> List[ChapterContent]:
        """Generate story with real-time sequential checking"""
        chapters = []
        chapter_count = plot_context.get('chapter_count', 10)
        
        for chapter_num in range(1, chapter_count + 1):
            logger.info(f"Generating chapter {chapter_num}/{chapter_count}")
            
            # Update story generator progress
            progress = (chapter_num / chapter_count) * 85
            await self.story_generator_agent.update_progress(
                project_id, AgentStatusEnum.running, progress,
                f"Writing Chapter {chapter_num}"
            )
            
            # Generate single chapter
            chapter = await self._generate_single_chapter(
                project_id, chapter_num, chapters, world_context, 
                character_context, plot_context, target_words
            )
            
            # Sequential check
            logger.info(f"Sequential checking chapter {chapter_num}")
            checked_chapter = await self.sequential_checker_agent.check_and_fix_chapter(
                project_id, chapter, chapters, world_context, character_context
            )
            
            chapters.append(checked_chapter)
            
            # Update project with new chapter
            await self.db.story_projects.update_one(
                {"id": project_id},
                {
                    "$push": {"chapters": checked_chapter.dict()},
                    "$inc": {"total_word_count": checked_chapter.word_count}
                }
            )
            
            logger.info(f"Chapter {chapter_num} completed. Sequential check: {'PASSED' if checked_chapter.sequential_check_passed else 'ISSUES FIXED'}")
        
        # Mark story generation as completed
        await self.story_generator_agent.update_progress(
            project_id, AgentStatusEnum.completed, 100, "All chapters completed"
        )
        
        return chapters
    
    async def _generate_single_chapter(self, project_id: str, chapter_num: int, 
                                     previous_chapters: List[ChapterContent],
                                     world_context: Dict, character_context: Dict, 
                                     plot_context: Dict, target_words: int) -> ChapterContent:
        """Generate a single chapter"""
        
        # Create context summary
        previous_summary = ""
        if previous_chapters:
            previous_summary = "PREVIOUS CHAPTERS SUMMARY:\n"
            for ch in previous_chapters[-2:]:  # Last 2 chapters for context
                previous_summary += f"Chapter {ch.chapter_number}: {ch.title}\n"
                previous_summary += f"Key events: {ch.content[:200]}...\n\n"
        
        chapter_prompt = f"""
        Write Chapter {chapter_num} of {plot_context.get('chapter_count', 10)} for this story.
        
        WORLD CONTEXT:
        {world_context.get('world_bible', '')}
        
        CHARACTER PROFILES:
        {json.dumps(character_context.get('character_profiles', {}), indent=2)[:1000]}...
        
        PLOT STRUCTURE:
        {plot_context.get('plot_structure', '')}
        
        {previous_summary}
        
        TARGET WORD COUNT: {target_words} words
        
        Requirements for Chapter {chapter_num}:
        1. Follow the established plot structure for this chapter
        2. Maintain character consistency with established profiles
        3. Follow world rules and maintain atmosphere
        4. Ensure smooth continuation from previous chapters
        5. Include rich sensory details, dialogue, and action
        6. Advance both plot and character development
        7. Write in a compelling, engaging narrative style
        8. Target approximately {target_words} words
        9. End with appropriate tension or resolution for this point in the story
        
        Format:
        - Start with a compelling chapter title
        - Write the full chapter content
        - Use proper paragraph breaks and dialogue formatting
        
        Write Chapter {chapter_num} now:
        """
        
        response = await self.mistral_client.chat.complete_async(
            model="mistral-large-latest",
            messages=[{"role": "user", "content": chapter_prompt}],
            max_tokens=min(4000, target_words // 100 * 150),
            temperature=0.7
        )
        
        chapter_content = response.choices[0].message.content
        
        # Extract title and content
        lines = chapter_content.split('\n', 2)
        title = lines[0].strip().replace('#', '').replace('Chapter', '').replace(str(chapter_num), '').replace(':', '').strip()
        if not title:
            title = f"Chapter {chapter_num}"
        
        content = lines[1].strip() if len(lines) > 1 else chapter_content
        if len(lines) > 2:
            content = '\n'.join(lines[1:]).strip()
        
        # Count words
        word_count = len(content.split())
        
        return ChapterContent(
            chapter_number=chapter_num,
            title=title,
            content=content,
            word_count=word_count
        )
    
    async def _format_final_document(self, project_id: str, title: str, 
                                   chapters: List[ChapterContent]) -> str:
        """Format the final document for KDP"""
        await self.document_formatter.update_progress(
            self.db, project_id, AgentStatusEnum.running, 50, "Formatting document for KDP"
        )
        
        document_path = await self.document_formatter.create_kdp_document(
            title, chapters, project_id
        )
        
        await self.document_formatter.update_progress(
            self.db, project_id, AgentStatusEnum.completed, 100, "Document formatting completed"
        )
        
        return document_path
    
    async def get_project_progress(self, project_id: str) -> Dict[str, Any]:
        """Get current progress of a project"""
        try:
            # Get project status
            project_doc = await self.db.story_projects.find_one({"id": project_id})
            if not project_doc:
                return {"error": "Project not found"}
            
            # Get agent progress
            agent_progress_docs = await self.db.agent_progress.find(
                {"project_id": project_id}
            ).to_list(None)
            
            agent_progress = [AgentProgress(**doc) for doc in agent_progress_docs]
            
            return {
                "project_id": project_id,
                "overall_status": project_doc.get("current_status", "pending"),
                "overall_progress": project_doc.get("progress_percentage", 0.0),
                "current_agent": project_doc.get("current_agent"),
                "total_chapters": len(project_doc.get("chapters", [])),
                "total_words": project_doc.get("total_word_count", 0),
                "agents_progress": [progress.dict() for progress in agent_progress]
            }
        
        except Exception as e:
            logger.error(f"Error getting progress for project {project_id}: {str(e)}")
            return {"error": str(e)}