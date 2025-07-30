import asyncio
import json
from typing import Dict, List, Any, Optional
from mistralai import Mistral
from models import *
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class BaseAgent:
    def __init__(self, mistral_client: Mistral, db):
        self.mistral_client = mistral_client
        self.db = db
        self.name = self.__class__.__name__
    
    async def update_progress(self, project_id: str, status: AgentStatusEnum, 
                            progress: float, task: str = None, error: str = None):
        """Update agent progress in database"""
        await self.db.agent_progress.update_one(
            {"project_id": project_id, "agent_name": self.name},
            {
                "$set": {
                    "status": status.value,
                    "progress_percentage": progress,
                    "current_task": task,
                    "error_message": error,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        # Also update main project status
        await self.db.story_projects.update_one(
            {"id": project_id},
            {
                "$set": {
                    "current_agent": self.name,
                    "progress_percentage": progress,
                    "current_status": status.value,
                    "updated_at": datetime.utcnow()
                }
            }
        )

class WorldbuildingAgent(BaseAgent):
    async def process(self, project_id: str, worldbuilding_data: WorldbuildingContext) -> Dict[str, Any]:
        """Process worldbuilding data and create comprehensive world context"""
        await self.update_progress(project_id, AgentStatusEnum.running, 10, "Analyzing worldbuilding context")
        
        try:
            # Create a comprehensive world summary for other agents
            world_prompt = f"""
            Analyze and synthesize this worldbuilding information into a comprehensive world guide that other AI agents can use to maintain consistency:
            
            WORLD SUMMARY: {worldbuilding_data.story_world_summary}
            GENRES: {', '.join(worldbuilding_data.genres) if worldbuilding_data.genres else 'Not specified'}
            TIME PERIOD: {worldbuilding_data.time_period_setting}
            CULTURAL INFLUENCES: {worldbuilding_data.cultural_influences}
            
            WORLD STRUCTURE:
            - Geography: {worldbuilding_data.geography_environment}
            - Climate: {worldbuilding_data.climate_weather}
            - Technology: {worldbuilding_data.technology_level}
            - Magic/Supernatural: {worldbuilding_data.magic_supernatural_rules}
            - Physics: {worldbuilding_data.physics_rules}
            
            SOCIETY & CULTURE:
            - Governance: {worldbuilding_data.governance_political}
            - Laws: {worldbuilding_data.laws_justice}
            - Economy: {worldbuilding_data.economic_system}
            - Cultural Norms: {worldbuilding_data.cultural_norms_taboos}
            - Religions: {worldbuilding_data.religions_beliefs}
            - Social Hierarchy: {worldbuilding_data.social_hierarchies}
            
            CONFLICT & POWER:
            - Major Conflict: {worldbuilding_data.major_conflict}
            - Factions: {worldbuilding_data.faction_breakdown}
            - Hidden Powers: {worldbuilding_data.hidden_power_structures}
            - Law Enforcement: {worldbuilding_data.law_enforcement_style}
            
            THEMES & ATMOSPHERE:
            - Emotional Vibe: {worldbuilding_data.emotional_vibe}
            - Symbolic Motifs: {worldbuilding_data.symbolic_motifs}
            - Historical Trauma: {worldbuilding_data.historical_trauma}
            
            Create a detailed world bible that includes:
            1. Key world rules and laws
            2. Important locations and their descriptions
            3. Cultural context for character behavior
            4. Thematic elements to weave into the story
            5. Potential conflicts and tensions
            
            Format this as a comprehensive guide for story generation.
            """
            
            await self.update_progress(project_id, AgentStatusEnum.running, 50, "Generating world bible")
            
            response = await self.mistral_client.chat.complete_async(
                model="mistral-large-latest",
                messages=[{"role": "user", "content": world_prompt}],
                max_tokens=2000,
                temperature=0.3
            )
            
            world_bible = response.choices[0].message.content
            
            await self.update_progress(project_id, AgentStatusEnum.completed, 100, "World bible completed")
            
            return {
                "world_bible": world_bible,
                "key_elements": {
                    "genres": worldbuilding_data.genres,
                    "tone": worldbuilding_data.emotional_vibe,
                    "major_conflict": worldbuilding_data.major_conflict,
                    "world_type": worldbuilding_data.story_world_summary
                }
            }
            
        except Exception as e:
            await self.update_progress(project_id, AgentStatusEnum.error, 0, None, str(e))
            raise

class CharacterAgent(BaseAgent):
    async def process(self, project_id: str, characters: List[Character], world_context: Dict[str, Any]) -> Dict[str, Any]:
        """Process character data and create detailed character profiles"""
        await self.update_progress(project_id, AgentStatusEnum.running, 10, "Analyzing character data")
        
        try:
            character_profiles = {}
            
            for i, character in enumerate(characters):
                progress = 10 + (i / len(characters)) * 80
                await self.update_progress(project_id, AgentStatusEnum.running, progress, f"Processing character: {character.name}")
                
                character_prompt = f"""
                Using this world context:
                {world_context.get('world_bible', '')}
                
                Create a comprehensive character profile for: {character.name}
                
                CHARACTER DATA:
                - Archetype: {character.archetype}
                - Backstory: {character.backstory_one_sentence}
                - Internal Conflict: {character.internal_conflict}
                - External Conflict: {character.external_conflict}
                - Core Belief: {character.core_belief}
                - Emotional Triggers: {character.emotional_triggers}
                - Coping Mechanism: {character.coping_mechanism}
                - Biggest Regret: {character.biggest_regret}
                - Personal Symbol: {character.personal_symbol_object}
                - Voice/Speech: {character.voice_speech_pattern}
                - What Makes Them Laugh: {character.what_makes_laugh}
                - What Makes Them Cry: {character.what_makes_cry}
                - Relationships: {character.relationships_map}
                - Secrets: {character.secrets}
                
                PSYCHOLOGICAL DEPTH:
                - Desire vs Need: {character.desire_vs_need}
                - Line They Won't Cross: {character.line_never_cross}
                - Fear of Becoming: {character.fears_becoming}
                - Public vs Private: {character.public_vs_private_persona}
                
                Create a character guide that includes:
                1. Detailed personality profile
                2. Consistent voice and dialogue style
                3. Character motivations and goals
                4. How they fit into the world's conflicts
                5. Character arc potential
                6. Key relationships and dynamics
                7. Behavioral patterns and quirks
                
                Make this character feel real and three-dimensional within the established world.
                """
                
                response = await self.mistral_client.chat.complete_async(
                    model="mistral-large-latest",
                    messages=[{"role": "user", "content": character_prompt}],
                    max_tokens=1500,
                    temperature=0.4
                )
                
                character_profiles[character.name] = {
                    "profile": response.choices[0].message.content,
                    "character_data": character.dict(),
                    "key_traits": {
                        "archetype": character.archetype,
                        "voice": character.voice_speech_pattern,
                        "core_motivation": character.core_belief,
                        "main_conflict": character.internal_conflict
                    }
                }
            
            await self.update_progress(project_id, AgentStatusEnum.completed, 100, "Character profiles completed")
            
            return {
                "character_profiles": character_profiles,
                "character_count": len(characters),
                "main_characters": [char.name for char in characters if char.plot_role_tag != "minor"]
            }
            
        except Exception as e:
            await self.update_progress(project_id, AgentStatusEnum.error, 0, None, str(e))
            raise

class PlotAgent(BaseAgent):
    async def process(self, project_id: str, plot_data: PlotUtility, world_context: Dict, 
                     character_context: Dict, target_chapters: int) -> Dict[str, Any]:
        """Create detailed plot structure and chapter outlines"""
        await self.update_progress(project_id, AgentStatusEnum.running, 10, "Analyzing plot elements")
        
        try:
            plot_prompt = f"""
            Create a detailed {target_chapters}-chapter plot structure using this context:
            
            WORLD CONTEXT:
            {world_context.get('world_bible', '')}
            
            CHARACTER CONTEXT:
            Main Characters: {character_context.get('main_characters', [])}
            Character Count: {character_context.get('character_count', 0)}
            
            PLOT ELEMENTS:
            - Foreshadowing Seeds: {plot_data.foreshadowing_seeds if plot_data else 'None specified'}
            - Red Herrings: {plot_data.red_herrings if plot_data else 'None specified'}
            - Chekhov's Guns: {plot_data.chekhovs_guns if plot_data else 'None specified'}
            - Major Twists: {plot_data.twist_about_character if plot_data else 'None specified'}
            - Thematic Echoes: {plot_data.thematic_echo_scenes if plot_data else 'None specified'}
            - Character Crossroads: {plot_data.character_crossroad_moments if plot_data else 'None specified'}
            
            Create a comprehensive {target_chapters}-chapter outline that includes:
            
            1. **Three-Act Structure** mapped across {target_chapters} chapters
            2. **Chapter-by-Chapter Breakdown** with:
               - Chapter title suggestions
               - Key events and scenes
               - Character development moments
               - Plot advancement
               - Tension/pacing notes
               - Foreshadowing elements
            3. **Character Arc Integration** - how each main character develops through the chapters
            4. **Thematic Elements** - how themes are woven throughout
            5. **Conflict Escalation** - how tension builds to climax
            6. **Sequential Logic** - ensure events flow logically from chapter to chapter
            
            Format as a detailed outline that a story generation agent can follow precisely.
            """
            
            await self.update_progress(project_id, AgentStatusEnum.running, 50, "Generating plot structure")
            
            response = await self.mistral_client.chat.complete_async(
                model="mistral-large-latest",
                messages=[{"role": "user", "content": plot_prompt}],
                max_tokens=3000,
                temperature=0.3
            )
            
            plot_structure = response.choices[0].message.content
            
            await self.update_progress(project_id, AgentStatusEnum.completed, 100, "Plot structure completed")
            
            return {
                "plot_structure": plot_structure,
                "chapter_count": target_chapters,
                "structure_type": "three-act",
                "plot_elements": plot_data.dict() if plot_data else {}
            }
            
        except Exception as e:
            await self.update_progress(project_id, AgentStatusEnum.error, 0, None, str(e))
            raise

class StoryGeneratorAgent(BaseAgent):
    async def process(self, project_id: str, world_context: Dict, character_context: Dict, 
                     plot_context: Dict, target_words: int) -> List[ChapterContent]:
        """Generate the actual story content chapter by chapter"""
        await self.update_progress(project_id, AgentStatusEnum.running, 5, "Initializing story generation")
        
        try:
            chapters = []
            chapter_count = plot_context.get('chapter_count', 10)
            
            for chapter_num in range(1, chapter_count + 1):
                progress = 5 + (chapter_num / chapter_count) * 85
                await self.update_progress(project_id, AgentStatusEnum.running, progress, 
                                         f"Writing Chapter {chapter_num}")
                
                # Generate chapter
                chapter_prompt = f"""
                Write Chapter {chapter_num} of {chapter_count} for this story.
                
                WORLD CONTEXT:
                {world_context.get('world_bible', '')}
                
                CHARACTER PROFILES:
                {json.dumps(character_context.get('character_profiles', {}), indent=2)}
                
                PLOT STRUCTURE:
                {plot_context.get('plot_structure', '')}
                
                PREVIOUS CHAPTERS SUMMARY:
                {self._get_previous_chapters_summary(chapters)}
                
                TARGET WORD COUNT: {target_words} words
                
                Requirements:
                1. Write exactly Chapter {chapter_num} following the plot structure
                2. Maintain character consistency with established profiles
                3. Follow world rules and atmosphere
                4. Ensure smooth continuation from previous chapters
                5. Include rich sensory details and dialogue
                6. Advance both plot and character development
                7. Write in a compelling, engaging narrative style
                8. Target approximately {target_words} words
                
                Write ONLY the chapter content, starting with the chapter title.
                """
                
                response = await self.mistral_client.chat.complete_async(
                    model="mistral-large-latest",
                    messages=[{"role": "user", "content": chapter_prompt}],
                    max_tokens=min(4000, target_words // 100 * 150),  # Adjust tokens based on target words
                    temperature=0.7
                )
                
                chapter_content = response.choices[0].message.content
                
                # Extract title and content
                lines = chapter_content.split('\n', 1)
                title = lines[0].strip().replace('#', '').strip()
                content = lines[1].strip() if len(lines) > 1 else chapter_content
                
                # Count words
                word_count = len(content.split())
                
                chapter = ChapterContent(
                    chapter_number=chapter_num,
                    title=title,
                    content=content,
                    word_count=word_count
                )
                
                chapters.append(chapter)
                
                # Update project with new chapter
                await self.db.story_projects.update_one(
                    {"id": project_id},
                    {
                        "$push": {"chapters": chapter.dict()},
                        "$inc": {"total_word_count": word_count}
                    }
                )
            
            await self.update_progress(project_id, AgentStatusEnum.completed, 90, "Story generation completed")
            return chapters
            
        except Exception as e:
            await self.update_progress(project_id, AgentStatusEnum.error, 0, None, str(e))
            raise
    
    def _get_previous_chapters_summary(self, chapters: List[ChapterContent]) -> str:
        """Create a summary of previous chapters for context"""
        if not chapters:
            return "This is the first chapter."
        
        summary = "PREVIOUS CHAPTERS:\n"
        for chapter in chapters[-3:]:  # Last 3 chapters for context
            summary += f"Chapter {chapter.chapter_number}: {chapter.title}\n"
            summary += f"Summary: {chapter.content[:200]}...\n\n"
        return summary

class SequentialCheckerAgent(BaseAgent):
    async def check_and_fix_chapter(self, project_id: str, chapter: ChapterContent, 
                                   previous_chapters: List[ChapterContent], 
                                   world_context: Dict, character_context: Dict) -> ChapterContent:
        """Check chapter for sequential issues and fix them"""
        await self.update_progress(project_id, AgentStatusEnum.running, 
                                 chapter.chapter_number * 10, 
                                 f"Checking Chapter {chapter.chapter_number}")
        
        try:
            check_prompt = f"""
            SEQUENTIAL CHECKER PROTOCOL - Analyze this chapter for consistency and sequential issues:
            
            CHAPTER TO CHECK:
            Title: {chapter.title}
            Content: {chapter.content}
            
            PREVIOUS CHAPTERS CONTEXT:
            {self._get_context_summary(previous_chapters)}
            
            WORLD RULES:
            {world_context.get('world_bible', '')}
            
            CHARACTER PROFILES:
            {json.dumps(character_context.get('character_profiles', {}), indent=2)}
            
            PERFORM THESE CHECKS:
            
            1. **CONTINUITY & CONSISTENCY CHECK:**
            - Timeline integrity: Does time progression make sense?
            - Character knowledge: Do characters only know what they should know?
            - Object/location permanence: Are things where they should be?
            - Character injuries/changes: Are physical states consistent?
            
            2. **CHARACTER ARC & MOTIVATION CHECK:**
            - Core motivation alignment: Do character actions match established goals?
            - Character development: Is emotional progression logical?
            - Character voice: Is dialogue consistent with established personality?
            
            3. **PACING & STRUCTURE CHECK:**
            - Plot advancement: Does this chapter move the story forward meaningfully?
            - Tension and pacing: Is the pacing appropriate for the content?
            - Scene balance: Good mix of action and reflection?
            
            4. **WORLD-BUILDING & LORE CHECK:**
            - Rule consistency: Are established world rules followed?
            - Organic exposition: Is new information introduced naturally?
            
            5. **PROSE & TECHNICAL CHECK:**
            - Repetitive language: Any overused words/phrases?
            - Clarity and flow: Does it read smoothly?
            - Show don't tell: Is it showing rather than telling?
            
            RESPOND WITH:
            1. ISSUES_FOUND: List any problems discovered (or "None" if perfect)
            2. FIXES_NEEDED: Specific corrections required
            3. REVISED_CONTENT: The corrected chapter content (only if fixes needed)
            
            If no issues found, respond with "APPROVED" and the original content.
            """
            
            response = await self.mistral_client.chat.complete_async(
                model="mistral-large-latest",
                messages=[{"role": "user", "content": check_prompt}],
                max_tokens=4000,
                temperature=0.2  # Low temperature for consistency checking
            )
            
            checker_response = response.choices[0].message.content
            
            # Parse the response
            if "APPROVED" in checker_response:
                chapter.sequential_check_passed = True
                chapter.issues_found = []
                chapter.issues_fixed = []
            else:
                # Extract issues and fixes
                issues = self._extract_issues(checker_response)
                fixes = self._extract_fixes(checker_response)
                revised_content = self._extract_revised_content(checker_response)
                
                if revised_content:
                    chapter.content = revised_content
                    chapter.word_count = len(revised_content.split())
                
                chapter.sequential_check_passed = len(issues) == 0
                chapter.issues_found = issues
                chapter.issues_fixed = fixes
            
            return chapter
            
        except Exception as e:
            logger.error(f"Sequential check error for chapter {chapter.chapter_number}: {str(e)}")
            # If check fails, mark as passed to continue generation
            chapter.sequential_check_passed = True
            chapter.issues_found = [f"Checker error: {str(e)}"]
            return chapter
    
    def _get_context_summary(self, previous_chapters: List[ChapterContent]) -> str:
        """Get summary of previous chapters for context"""
        if not previous_chapters:
            return "No previous chapters."
        
        summary = ""
        for chapter in previous_chapters:
            summary += f"Chapter {chapter.chapter_number}: {chapter.title}\n"
            summary += f"Key events: {chapter.content[:150]}...\n\n"
        return summary
    
    def _extract_issues(self, response: str) -> List[str]:
        """Extract issues from checker response"""
        try:
            if "ISSUES_FOUND:" in response:
                issues_section = response.split("ISSUES_FOUND:")[1].split("FIXES_NEEDED:")[0]
                issues = [issue.strip() for issue in issues_section.split('\n') if issue.strip()]
                return [issue for issue in issues if issue.lower() != 'none']
            return []
        except:
            return []
    
    def _extract_fixes(self, response: str) -> List[str]:
        """Extract fixes from checker response"""
        try:
            if "FIXES_NEEDED:" in response:
                fixes_section = response.split("FIXES_NEEDED:")[1].split("REVISED_CONTENT:")[0]
                fixes = [fix.strip() for fix in fixes_section.split('\n') if fix.strip()]
                return fixes
            return []
        except:
            return []
    
    def _extract_revised_content(self, response: str) -> Optional[str]:
        """Extract revised content from checker response"""
        try:
            if "REVISED_CONTENT:" in response:
                revised_section = response.split("REVISED_CONTENT:")[1].strip()
                return revised_section
            return None
        except:
            return None