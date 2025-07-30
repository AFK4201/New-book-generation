import { useState } from "react";

const WorldbuildingTab = ({ data, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    society: false,
    conflict: false,
    mindset: false,
    modern: false,
    themes: false,
    physical: false,
    utility: false
  });

  const updateField = (field, value) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const CollapsibleSection = ({ title, icon, sectionKey, children }) => (
    <div className="mb-6 border border-white/20 rounded-lg overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 transition duration-200 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <span className="text-white text-xl">
          {expandedSections[sectionKey] ? "−" : "+"}
        </span>
      </button>
      {expandedSections[sectionKey] && (
        <div className="p-6 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  const TextArea = ({ label, field, placeholder, rows = 3 }) => (
    <div>
      <label className="block text-white text-sm font-medium mb-2">{label}</label>
      <textarea
        value={data[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-vertical"
      />
    </div>
  );

  const TextInput = ({ label, field, placeholder }) => (
    <div>
      <label className="block text-white text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        value={data[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );

  const MultiSelect = ({ label, field, options }) => {
    const selectedGenres = data[field] || [];
    
    const toggleGenre = (genre) => {
      const newGenres = selectedGenres.includes(genre)
        ? selectedGenres.filter(g => g !== genre)
        : [...selectedGenres, genre];
      updateField(field, newGenres);
    };

    return (
      <div>
        <label className="block text-white text-sm font-medium mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button
              key={option}
              onClick={() => toggleGenre(option)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                selectedGenres.includes(option)
                  ? "bg-purple-500 text-white"
                  : "bg-white/20 text-gray-300 hover:bg-white/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const genres = ["crime", "romance", "tragedy", "thriller", "noir", "slice-of-life", "sci-fi", "fantasy", "horror", "mystery", "drama", "adventure"];

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🌍 Worldbuilding Context</h2>
        <p className="text-gray-300">
          Define the world, society, and atmosphere that will ground your characters and themes
        </p>
      </div>

      {/* Core World Structure */}
      <CollapsibleSection title="Core World Structure" icon="🏗️" sectionKey="core">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Story World Summary"
            field="story_world_summary"
            placeholder="e.g., modern Tokyo, post-apocalyptic desert, cyberpunk mega-city"
            rows={3}
          />
          <MultiSelect
            label="Genre(s)"
            field="genres"
            options={genres}
          />
          <TextInput
            label="Time Period / Setting"
            field="time_period_setting"
            placeholder="e.g., Victorian London, 2087 Mars Colony, Medieval Fantasy"
          />
          <TextInput
            label="Cultural Influences"
            field="cultural_influences"
            placeholder="e.g., Japanese, Slavic, urban Western, dystopian influences"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <TextArea
            label="Geography & Environment"
            field="geography_environment"
            placeholder="Urban, rural, wasteland, floating cities, underwater, forests?"
          />
          <TextArea
            label="Climate & Weather Patterns"
            field="climate_weather"
            placeholder="Hot, stormy, rain-soaked neon city, eternal winter?"
          />
          <TextArea
            label="Technology Level"
            field="technology_level"
            placeholder="Smartphones, cybernetic limbs, or spears and smoke signals?"
          />
          <TextArea
            label="Magic / Supernatural Rules"
            field="magic_supernatural_rules"
            placeholder="If applicable - or specify 'No supernatural' to ground the tone"
          />
          <TextArea
            label="Physics Rules (if broken)"
            field="physics_rules"
            placeholder="Any laws of nature that don't apply in this world?"
          />
        </div>
      </CollapsibleSection>

      {/* Society & Culture */}
      <CollapsibleSection title="Society & Culture" icon="🏛️" sectionKey="society">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Governance / Political Systems"
            field="governance_political"
            placeholder="Dictators, councils, gangs, corporations, AI overlords?"
          />
          <TextArea
            label="Laws & Justice System"
            field="laws_justice"
            placeholder="Fair? Corrupt? Brutal? Vigilante-run?"
          />
          <TextArea
            label="Economic System"
            field="economic_system"
            placeholder="Rich-poor divide? Barter system? Crypto? Syndicate-controlled black market?"
          />
          <TextArea
            label="Cultural Norms & Taboos"
            field="cultural_norms_taboos"
            placeholder="What's considered respectful? What gets you shunned?"
          />
          <TextArea
            label="Major Religions / Belief Systems"
            field="religions_beliefs"
            placeholder="One god, many gods, no gods, ancestral spirits, tech cults?"
          />
          <TextArea
            label="Cultural Festivals or Rituals"
            field="cultural_festivals"
            placeholder="Dia de los Muertos, blood moon hunts, corporate evaluation weeks"
          />
          <TextArea
            label="Social Hierarchies / Castes"
            field="social_hierarchies"
            placeholder="Royalty? Slums? Classism? Are certain people 'lesser' by default?"
          />
          <TextArea
            label="Languages & Dialects"
            field="languages_dialects"
            placeholder="Do different regions or classes speak differently?"
          />
        </div>
      </CollapsibleSection>

      {/* Conflict & Power Dynamics */}
      <CollapsibleSection title="Conflict & Power Dynamics" icon="⚔️" sectionKey="conflict">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Current Major Conflict"
            field="major_conflict"
            placeholder="War? Rebellion? Cold war tension? Corporate wars? Ethnic cleansing?"
          />
          <TextArea
            label="Faction Breakdown"
            field="faction_breakdown"
            placeholder="Names, symbols, ideologies of groups (political parties, cults, gangs, rebellion cells)"
          />
          <TextArea
            label="Hidden Power Structures"
            field="hidden_power_structures"
            placeholder="Who's really in charge behind the curtain? Corrupt priesthood? Secret families?"
          />
          <TextArea
            label="Law Enforcement Style"
            field="law_enforcement_style"
            placeholder="Peacekeepers, brutal cops, AI drones, mafia-led security?"
          />
          <TextArea
            label="Weapons / Combat Culture"
            field="weapons_combat_culture"
            placeholder="Do people fight? How? Guns, blades, psychic powers, dirty street brawls?"
          />
        </div>
      </CollapsibleSection>

      {/* Cultural Mindset & Psychology */}
      <CollapsibleSection title="Cultural Mindset & Psychology" icon="🧠" sectionKey="mindset">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="How Do People View Death?"
            field="view_of_death"
            placeholder="Honored? Feared? Celebrated? Ignored?"
          />
          <TextArea
            label="View of Time"
            field="view_of_time"
            placeholder="Linear like the West? Circular like Eastern beliefs? Time loops? Timeless void?"
          />
          <TextArea
            label="Honor vs. Survival Society?"
            field="honor_vs_survival"
            placeholder="Do people value reputation or just staying alive?"
          />
          <TextArea
            label="Individual vs. Collective Thinking?"
            field="individual_vs_collective"
            placeholder="Are people expected to sacrifice for others, or look out for #1?"
          />
          <TextArea
            label="How is Emotion Expressed?"
            field="emotion_expression"
            placeholder="Stoicism? Loud mourning? Repression? Constant drama?"
          />
        </div>
      </CollapsibleSection>

      {/* Modern/Tech World Specifics */}
      <CollapsibleSection title="Modern/Tech World Specifics" icon="💻" sectionKey="modern">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Media & Propaganda"
            field="media_propaganda"
            placeholder="How are people influenced? News? Memes? Mind implants?"
          />
          <TextArea
            label="Surveillance Level"
            field="surveillance_level"
            placeholder="Private lives or 24/7 watched? Black mirror-style or no tech at all?"
          />
          <TextArea
            label="Internet / Info Access"
            field="internet_info_access"
            placeholder="Free or restricted? Truthful or controlled by the powerful?"
          />
          <TextArea
            label="Popular Culture"
            field="popular_culture"
            placeholder="What's trending? Fashion, slang, music, idols, subcultures."
          />
        </div>
      </CollapsibleSection>

      {/* World Themes & Emotional Tone */}
      <CollapsibleSection title="World Themes & Emotional Tone" icon="🎭" sectionKey="themes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Emotional Vibe of the World"
            field="emotional_vibe"
            placeholder="Hopeful, tense, decaying, cold, grimy, playful, absurd?"
          />
          <TextArea
            label="Symbolic Motifs in the World"
            field="symbolic_motifs"
            placeholder="mirrors, chains, masks, blood, neon, snow, rust, birds — recurring symbolic imagery"
            rows={2}
          />
          <TextArea
            label="Historical Trauma / Legacy"
            field="historical_trauma"
            placeholder="Did this world survive a war, plague, collapse, revolution? It shapes everything."
          />
          <TextArea
            label="Who Has Power Over Truth?"
            field="power_over_truth"
            placeholder="Very important in political thrillers and noir. Can people even access facts?"
          />
        </div>
      </CollapsibleSection>

      {/* Physical Detail Ideas for Visual Storytelling */}
      <CollapsibleSection title="Physical Details for Visual Storytelling" icon="🎨" sectionKey="physical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Architecture Style"
            field="architecture_style"
            placeholder="Shinto shrines next to glass skyscrapers? Cyberpunk with Edo rooflines?"
          />
          <TextInput
            label="Fashion Trends"
            field="fashion_trends"
            placeholder="Streetwear, ceremonial robes, tactical gear, vintage '80s, all black everything?"
          />
          <TextInput
            label="Transportation"
            field="transportation"
            placeholder="Foot? Maglev trains? Pirate ships? Urban bikes? Portal jumps?"
          />
          <TextInput
            label="Food Culture"
            field="food_culture"
            placeholder="What do people eat? Are certain meals sacred? Is food scarce?"
          />
          <TextArea
            label="Street Sounds & Smells"
            field="street_sounds_smells"
            placeholder="Add this for immersion — oil, incense, blood, sewage, perfume, rain on neon."
          />
        </div>
      </CollapsibleSection>

      {/* Story Utility-Specific */}
      <CollapsibleSection title="Story Utility-Specific" icon="🎯" sectionKey="utility">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="How the World Challenges the Protagonist"
            field="world_challenges_protagonist"
            placeholder="What does this world demand from them emotionally or morally?"
          />
          <TextArea
            label="What the World Rewards"
            field="world_rewards"
            placeholder="Loyalty? Ruthlessness? Intelligence? Obedience? Performance?"
          />
          <TextArea
            label="What Would Get You Killed Here?"
            field="what_gets_you_killed"
            placeholder="Saying the wrong name? Loving the wrong person? Crossing a district line?"
          />
          <TextArea
            label="What's Changing in This World Right Now?"
            field="whats_changing"
            placeholder="Something shifting beneath the surface — ripe for drama."
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default WorldbuildingTab;