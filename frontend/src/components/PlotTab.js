import { useState } from "react";

const PlotTab = ({ data, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState({
    foreshadowing: true,
    structure: false,
    tension: false,
    themes: false,
    twists: false
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

  const TextArea = ({ label, field, placeholder, rows = 3, description }) => (
    <div>
      <label className="block text-white text-sm font-medium mb-2">{label}</label>
      {description && (
        <p className="text-gray-400 text-xs mb-2 italic">{description}</p>
      )}
      <textarea
        value={data[field] || ""}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-vertical"
      />
    </div>
  );

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">📋 Plot Structure & Utility</h2>
        <p className="text-gray-300">
          Advanced plot engineering tools for creating sophisticated narrative structures with foreshadowing, tension management, and thematic resonance
        </p>
      </div>

      {/* Foreshadowing & Setup */}
      <CollapsibleSection title="Foreshadowing & Setup Elements" icon="🔮" sectionKey="foreshadowing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Foreshadowing Seeds"
            field="foreshadowing_seeds"
            placeholder="List early minor events/dialogues/imagery that hint at future reveals. Keep track of metaphorical language or visuals that gain deeper meaning later."
            description="Early hints that pay off later in the story"
            rows={4}
          />
          <TextArea
            label="Chekhov's Guns"
            field="chekhovs_guns"
            placeholder="Things introduced early that MUST pay off later. List of 'planted elements' that seem minor but have major plot use later."
            description="Elements that must be used if introduced"
            rows={4}
          />
          <TextArea
            label="Red Herrings"
            field="red_herrings"
            placeholder="Misleading clues, events, or characters that distract readers from the real twist. Can be characters, objects, or even a fake backstory."
            description="False clues to misdirect the audience"
            rows={4}
          />
          <TextArea
            label="Timebombs / Countdown Mechanisms"
            field="timebombs_countdown"
            placeholder="Internal or external ticking clock (a betrayal, an explosion, a deadline). Can be tied to character decisions or plot stakes."
            description="Time pressure elements"
            rows={4}
          />
        </div>
      </CollapsibleSection>

      {/* Structure & Flow */}
      <CollapsibleSection title="Structure & Flow Management" icon="🗂️" sectionKey="structure">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Multi-Arc Threads"
            field="multi_arc_threads"
            placeholder="Track subplot arcs that span the whole story (romance, revenge, ideology shift). Helps avoid subplot drop-offs or rushed conclusions."
            description="Subplots that run throughout the story"
            rows={4}
          />
          <TextArea
            label="Dynamic Power Balance"
            field="dynamic_power_balance"
            placeholder="A system to track how power/control shifts between characters or factions. Eg: Protagonist gains leverage, antagonist regains control, third party flips it."
            description="How control shifts throughout the story"
            rows={4}
          />
          <TextArea
            label="Character Crossroad Moments"
            field="character_crossroad_moments"
            placeholder="Moral or emotional decisions that define character development. Could go either way—track what leads to each choice."
            description="Key decision points for characters"
            rows={4}
          />
          <TextArea
            label="Reversal Markers"
            field="reversal_markers"
            placeholder="Key scenes where characters reverse their beliefs, positions, alliances. Track cause and effect that led to these reversal moments."
            description="Moments where characters change dramatically"
            rows={4}
          />
        </div>
      </CollapsibleSection>

      {/* Tension & Drama */}
      <CollapsibleSection title="Tension & Drama Engineering" icon="⚡" sectionKey="tension">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Dramatic Irony Layers"
            field="dramatic_irony_layers"
            placeholder="Info the audience knows that characters don't (or vice versa). Use to build suspense or emotional damage."
            description="What the audience knows vs. characters"
            rows={4}
          />
          <TextArea
            label="Thematic Echo Scenes"
            field="thematic_echo_scenes"
            placeholder="Scenes that mirror earlier ones with altered emotional/ethical weight. Eg: A betrayal scene echoed later by a sacrifice in the same place."
            description="Scenes that parallel earlier moments"
            rows={4}
          />
          <TextArea
            label="Location-based Stakes System"
            field="location_based_stakes"
            placeholder="Some places in the world carry emotional or political significance—track which scenes have to happen there and why."
            description="Important locations and why scenes must happen there"
            rows={4}
          />
          <TextArea
            label="NPC Catalyst Tracker"
            field="npc_catalyst_tracker"
            placeholder="Supporting or minor characters that unknowingly shift the main plot's direction. 'The bartender gave a name.' Boom—snowball starts rolling."
            description="Minor characters who cause major plot shifts"
            rows={4}
          />
        </div>
      </CollapsibleSection>

      {/* Themes & Symbolism */}
      <CollapsibleSection title="Themes & Symbolism" icon="🎭" sectionKey="themes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Symbolic Motif Tracking"
            field="symbolic_motif_tracking"
            placeholder="Symbols/imagery that repeat for emotional or thematic weight (cigarettes, clocks, blood, etc.). Great for unspoken storytelling."
            description="Recurring symbols and their meanings"
            rows={4}
          />
          <TextArea
            label="Parallel Plot Mirror"
            field="parallel_plot_mirror"
            placeholder="A secondary story arc (maybe even a historical or background one) that mirrors or contrasts the main arc. This could be from another generation, from the villain's POV, etc."
            description="Secondary storylines that reflect the main plot"
            rows={4}
          />
          <TextArea
            label="Plot-Driven Flashbacks / Visions"
            field="plot_driven_flashbacks"
            placeholder="Not random nostalgia, but reveals that re-contextualize what the reader/viewer thinks they know."
            description="Flashbacks that change everything"
            rows={4}
          />
          <TextArea
            label="Interwoven Timelines or Perspectives"
            field="interwoven_timelines"
            placeholder="If relevant: switching POVs or timelines to create tension, contrast, or deeper world insight."
            description="Multiple timeline or perspective structure"
            rows={4}
          />
        </div>
      </CollapsibleSection>

      {/* Plot Twists By Type */}
      <CollapsibleSection title="Plot Twists By Role" icon="🌪️" sectionKey="twists">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm italic">
            Instead of random twists, strategically plan revelations that recontextualize different aspects of your story:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextArea
              label="Twist About the World"
              field="twist_about_world"
              placeholder="A revelation that changes how we understand the setting, society, or rules of the world itself."
              description="World-changing revelations"
              rows={3}
            />
            <TextArea
              label="Twist About a Character"
              field="twist_about_character"
              placeholder="A character reveal that recontextualizes their entire arc or relationships."
              description="Character identity/motivation reveals"
              rows={3}
            />
            <TextArea
              label="Twist About the Goal"
              field="twist_about_goal"
              placeholder="The protagonist's mission or objective is revealed to be something entirely different."
              description="Mission/objective revelations"
              rows={3}
            />
            <TextArea
              label="Twist About Loyalties"
              field="twist_about_loyalties"
              placeholder="Alliances, betrayals, or relationships are revealed to be different than they appeared."
              description="Relationship/alliance reveals"
              rows={3}
            />
            <TextArea
              label="Twist About Assumed Truth"
              field="twist_about_assumed_truth"
              placeholder="Something the audience and characters believed to be factual is revealed as false or incomplete."
              description="Truth/reality revelations"
              rows={3}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Additional Tips */}
      <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-6 border border-purple-400/20">
        <h3 className="text-lg font-semibold text-white mb-3">💡 Plot Engineering Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">Foreshadowing Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Plant seeds early, harvest late</li>
              <li>Make early mentions seem natural/casual</li>
              <li>Use different characters to reinforce themes</li>
              <li>Visual/symbolic foreshadowing is powerful</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Tension Management:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Vary pacing between action and reflection</li>
              <li>End chapters on cliffhangers or revelations</li>
              <li>Use dramatic irony to create suspense</li>
              <li>Balance hope and despair</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Character Crossroads:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Every choice should have consequences</li>
              <li>Test characters' core beliefs</li>
              <li>Force hard moral decisions</li>
              <li>Show character growth through choices</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Twist Effectiveness:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Should feel surprising yet inevitable</li>
              <li>Recontextualizes earlier events</li>
              <li>Serves character and theme, not just shock</li>
              <li>Has emotional as well as plot impact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlotTab;