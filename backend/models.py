from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum

# Enums
class StoryGenreEnum(str, Enum):
    crime = "crime"
    romance = "romance"
    tragedy = "tragedy"
    thriller = "thriller"
    noir = "noir"
    slice_of_life = "slice-of-life"
    sci_fi = "sci-fi"
    fantasy = "fantasy"
    horror = "horror"
    mystery = "mystery"
    drama = "drama"
    adventure = "adventure"

class CharacterArchetypeEnum(str, Enum):
    mentor = "The Mentor"
    rival = "The Rival"
    wild_card = "The Wild Card"
    innocent = "The Innocent"
    traitor = "The Traitor"
    hero = "The Hero"
    villain = "The Villain"
    sidekick = "The Sidekick"
    love_interest = "The Love Interest"
    trickster = "The Trickster"

class CharacterArcTypeEnum(str, Enum):
    positive_change = "Positive Change"
    negative_fall = "Negative Fall"
    flat_arc = "Flat Arc"
    redemption_arc = "Redemption Arc"
    corruption_arc = "Corruption Arc"

class AgentStatusEnum(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    error = "error"
    
# Worldbuilding Models
class WorldbuildingContext(BaseModel):
    story_world_summary: Optional[str] = None
    genres: List[StoryGenreEnum] = []
    time_period_setting: Optional[str] = None
    cultural_influences: Optional[str] = None
    
    # Core World Structure
    geography_environment: Optional[str] = None
    climate_weather: Optional[str] = None
    time_period: Optional[str] = None
    technology_level: Optional[str] = None
    magic_supernatural_rules: Optional[str] = None
    physics_rules: Optional[str] = None
    
    # Society & Culture
    governance_political: Optional[str] = None
    laws_justice: Optional[str] = None
    economic_system: Optional[str] = None
    cultural_norms_taboos: Optional[str] = None
    religions_beliefs: Optional[str] = None
    cultural_festivals: Optional[str] = None
    social_hierarchies: Optional[str] = None
    languages_dialects: Optional[str] = None
    
    # Conflict & Power
    major_conflict: Optional[str] = None
    faction_breakdown: Optional[str] = None
    hidden_power_structures: Optional[str] = None
    law_enforcement_style: Optional[str] = None
    weapons_combat_culture: Optional[str] = None
    
    # Cultural Mindset
    view_of_death: Optional[str] = None
    view_of_time: Optional[str] = None
    honor_vs_survival: Optional[str] = None
    individual_vs_collective: Optional[str] = None
    emotion_expression: Optional[str] = None
    
    # Modern/Tech Specifics
    media_propaganda: Optional[str] = None
    surveillance_level: Optional[str] = None
    internet_info_access: Optional[str] = None
    popular_culture: Optional[str] = None
    
    # Themes & Tone
    emotional_vibe: Optional[str] = None
    symbolic_motifs: Optional[str] = None
    historical_trauma: Optional[str] = None
    power_over_truth: Optional[str] = None
    
    # Physical Details
    architecture_style: Optional[str] = None
    fashion_trends: Optional[str] = None
    transportation: Optional[str] = None
    food_culture: Optional[str] = None
    street_sounds_smells: Optional[str] = None
    
    # Story Utility
    world_challenges_protagonist: Optional[str] = None
    world_rewards: Optional[str] = None
    what_gets_you_killed: Optional[str] = None
    whats_changing: Optional[str] = None

# Character Models
class PsychologicalLayers(BaseModel):
    core_belief_self: Optional[str] = None
    core_belief_world: Optional[str] = None
    desire_vs_need: Optional[str] = None
    primary_coping_mechanism: Optional[str] = None
    emotional_blind_spot: Optional[str] = None
    trigger_points: Optional[str] = None
    emotional_armor: Optional[str] = None
    
    # Internal Conflict Drivers
    moral_dilemma: Optional[str] = None
    unconscious_fear: Optional[str] = None
    biggest_regret: Optional[str] = None
    source_of_shame: Optional[str] = None
    recurring_negative_thought: Optional[str] = None
    greatest_insecurity: Optional[str] = None
    self_sabotaging_behavior: Optional[str] = None
    
    # Self vs Identity
    pretend_to_be_vs_who_they_are: Optional[str] = None
    never_admit_out_loud: Optional[str] = None
    cant_forgive_self_for: Optional[str] = None
    personal_hell: Optional[str] = None
    values_most_deep_down: Optional[str] = None
    what_breaks_them_spiritually: Optional[str] = None
    
    # Motivation-Based
    core_motivation_underneath: Optional[str] = None
    seeks_from_others: Optional[str] = None
    handles_loss: Optional[str] = None
    responds_to_authority: Optional[str] = None
    pain_they_hide_most: Optional[str] = None
    
    # Behavioral
    love_attachment_style: Optional[str] = None
    fight_or_flight_response: Optional[str] = None
    deals_with_boredom: Optional[str] = None
    reacts_to_praise: Optional[str] = None
    would_die_to_protect: Optional[str] = None
    fears_becoming: Optional[str] = None
    
    # Mental Health (optional)
    mental_health_tags: Optional[str] = None
    trauma_response_style: Optional[str] = None
    memory_triggers: Optional[str] = None
    inner_monologue_style: Optional[str] = None

class Character(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    archetype: Optional[CharacterArchetypeEnum] = None
    backstory_one_sentence: Optional[str] = None
    internal_conflict: Optional[str] = None
    external_conflict: Optional[str] = None
    relationships_map: Optional[str] = None
    personal_symbol_object: Optional[str] = None
    
    # Psychological & Emotional Layers
    core_belief: Optional[str] = None
    emotional_triggers: Optional[str] = None
    comfort_zones: Optional[str] = None
    coping_mechanism: Optional[str] = None
    desire_vs_need: Optional[str] = None
    biggest_regret: Optional[str] = None
    emotional_armor: Optional[str] = None
    
    # Life & Past Impact
    defining_childhood_moment: Optional[str] = None
    first_major_betrayal: Optional[str] = None
    past_love_or_loss: Optional[str] = None
    family_role_dynamic: Optional[str] = None
    education_street_smarts: Optional[str] = None
    criminal_record_secret: Optional[str] = None
    
    # Dark Corners / Moral Edges
    line_never_cross: Optional[str] = None
    worst_thing_done: Optional[str] = None
    justification_wrongdoing: Optional[str] = None
    villain_origin: Optional[str] = None
    self_destruction_method: Optional[str] = None
    
    # Social Dynamics
    public_vs_private_persona: Optional[str] = None
    role_in_group: Optional[str] = None
    love_language_attachment: Optional[str] = None
    treats_weak_powerless: Optional[str] = None
    jealousy_triggers: Optional[str] = None
    loyalty_level: Optional[str] = None
    
    # Quirks & Humanity
    weird_habit: Optional[str] = None
    physical_tics_gestures: Optional[str] = None
    obsessions_hobbies: Optional[str] = None
    voice_speech_pattern: Optional[str] = None
    what_makes_laugh: Optional[str] = None
    what_makes_cry: Optional[str] = None
    
    # Narrative Design
    symbol_color_motif: Optional[str] = None
    arc_in_one_word: Optional[str] = None
    theme_connection: Optional[str] = None
    when_peak_collapse: Optional[str] = None
    ending_feel: Optional[str] = None
    
    # Psychology Deep Dive
    psychological_layers: Optional[PsychologicalLayers] = None
    
    # Plot Utility
    where_they_appear_chapters: Optional[str] = None
    plot_role_tag: Optional[str] = None
    secrets: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Plot Utility Models
class PlotUtility(BaseModel):
    # Foreshadowing & Structure
    foreshadowing_seeds: Optional[str] = None
    timebombs_countdown: Optional[str] = None
    red_herrings: Optional[str] = None
    chekhovs_guns: Optional[str] = None
    multi_arc_threads: Optional[str] = None
    dynamic_power_balance: Optional[str] = None
    dramatic_irony_layers: Optional[str] = None
    reversal_markers: Optional[str] = None
    thematic_echo_scenes: Optional[str] = None
    character_crossroad_moments: Optional[str] = None
    plot_driven_flashbacks: Optional[str] = None
    interwoven_timelines: Optional[str] = None
    symbolic_motif_tracking: Optional[str] = None
    location_based_stakes: Optional[str] = None
    npc_catalyst_tracker: Optional[str] = None
    parallel_plot_mirror: Optional[str] = None
    
    # Plot Twists By Role
    twist_about_world: Optional[str] = None
    twist_about_character: Optional[str] = None
    twist_about_goal: Optional[str] = None
    twist_about_loyalties: Optional[str] = None
    twist_about_assumed_truth: Optional[str] = None

# Story Generation Models
class StoryProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    target_chapters: int = 10
    target_words_per_chapter: int = 2000
    
    # Content Data
    worldbuilding: Optional[WorldbuildingContext] = None
    characters: List[Character] = []
    plot_utility: Optional[PlotUtility] = None
    
    # Generation Progress
    current_status: AgentStatusEnum = AgentStatusEnum.pending
    current_agent: Optional[str] = None
    progress_percentage: float = 0.0
    
    # Generated Content
    chapters: List[Dict[str, Any]] = []  # Will store chapter content
    total_word_count: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AgentProgress(BaseModel):
    agent_name: str
    status: AgentStatusEnum
    progress_percentage: float
    current_task: Optional[str] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None

class StoryGenerationRequest(BaseModel):
    project_id: str

class ChapterContent(BaseModel):
    chapter_number: int
    title: str
    content: str
    word_count: int
    sequential_check_passed: bool = False
    issues_found: List[str] = []
    issues_fixed: List[str] = []

# API Response Models
class StoryProjectResponse(BaseModel):
    project: StoryProject
    agents_progress: List[AgentProgress]