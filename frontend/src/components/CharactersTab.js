import { useState } from "react";

const CharactersTab = ({ data, onUpdate }) => {
  const [characters, setCharacters] = useState(data || []);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const updateCharacters = (newCharacters) => {
    setCharacters(newCharacters);
    onUpdate(newCharacters);
  };

  const addCharacter = () => {
    const newCharacter = {
      id: Date.now().toString(),
      name: `Character ${characters.length + 1}`,
      archetype: "",
      backstory_one_sentence: "",
      internal_conflict: "",
      external_conflict: "",
      relationships_map: "",
      personal_symbol_object: "",
      // All other fields will be empty initially
    };
    const newCharacters = [...characters, newCharacter];
    updateCharacters(newCharacters);
    setSelectedCharacter(characters.length);
  };

  const updateCharacter = (index, field, value) => {
    const newCharacters = [...characters];
    if (field.includes('.')) {
      // Handle nested fields like psychological_layers.core_belief_self
      const [parentField, childField] = field.split('.');
      if (!newCharacters[index][parentField]) {
        newCharacters[index][parentField] = {};
      }
      newCharacters[index][parentField][childField] = value;
    } else {
      newCharacters[index][field] = value;
    }
    updateCharacters(newCharacters);
  };

  const deleteCharacter = (index) => {
    const newCharacters = characters.filter((_, i) => i !== index);
    updateCharacters(newCharacters);
    if (selectedCharacter === index) {
      setSelectedCharacter(null);
    } else if (selectedCharacter > index) {
      setSelectedCharacter(selectedCharacter - 1);
    }
  };

  const toggleSection = (characterIndex, section) => {
    const key = `${characterIndex}-${section}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const CollapsibleSection = ({ title, icon, sectionKey, characterIndex, children }) => {
    const key = `${characterIndex}-${sectionKey}`;
    const isExpanded = expandedSections[key];
    
    return (
      <div className="mb-4 border border-white/20 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(characterIndex, sectionKey)}
          className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 transition duration-200 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm">{icon}</span>
            <h4 className="text-sm font-semibold text-white">{title}</h4>
          </div>
          <span className="text-white text-sm">
            {isExpanded ? "−" : "+"}
          </span>
        </button>
        {isExpanded && (
          <div className="p-4 space-y-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  const TextArea = ({ label, field, placeholder, rows = 2, characterIndex }) => (
    <div>
      <label className="block text-white text-xs font-medium mb-1">{label}</label>
      <textarea
        value={field.includes('.') 
          ? characters[characterIndex]?.[field.split('.')[0]]?.[field.split('.')[1]] || ""
          : characters[characterIndex]?.[field] || ""}
        onChange={(e) => updateCharacter(characterIndex, field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-vertical text-sm"
      />
    </div>
  );

  const TextInput = ({ label, field, placeholder, characterIndex }) => (
    <div>
      <label className="block text-white text-xs font-medium mb-1">{label}</label>
      <input
        type="text"
        value={field.includes('.') 
          ? characters[characterIndex]?.[field.split('.')[0]]?.[field.split('.')[1]] || ""
          : characters[characterIndex]?.[field] || ""}
        onChange={(e) => updateCharacter(characterIndex, field, e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm"
      />
    </div>
  );

  const Select = ({ label, field, options, characterIndex }) => (
    <div>
      <label className="block text-white text-xs font-medium mb-1">{label}</label>
      <select
        value={characters[characterIndex]?.[field] || ""}
        onChange={(e) => updateCharacter(characterIndex, field, e.target.value)}
        className="w-full p-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm"
      >
        <option value="">Select...</option>
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const archetypes = [
    { value: "The Mentor", label: "The Mentor" },
    { value: "The Rival", label: "The Rival" },
    { value: "The Wild Card", label: "The Wild Card" },
    { value: "The Innocent", label: "The Innocent" },
    { value: "The Traitor", label: "The Traitor" },
    { value: "The Hero", label: "The Hero" },
    { value: "The Villain", label: "The Villain" },
    { value: "The Sidekick", label: "The Sidekick" },
    { value: "The Love Interest", label: "The Love Interest" },
    { value: "The Trickster", label: "The Trickster" }
  ];

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">👥 Character Development</h2>
        <p className="text-gray-300">
          Create rich, complex characters with psychological depth and compelling arcs
        </p>
      </div>

      <div className="flex gap-6">
        {/* Character List Panel */}
        <div className="w-1/3">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Characters</h3>
              <button
                onClick={addCharacter}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 hover:scale-105"
              >
                + Add Character
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {characters.map((character, index) => (
                <div
                  key={character.id}
                  className={`p-3 rounded-lg cursor-pointer transition duration-200 ${
                    selectedCharacter === index
                      ? "bg-purple-500/30 border border-purple-400/50"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={() => setSelectedCharacter(index)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white text-sm truncate">
                        {character.name || `Character ${index + 1}`}
                      </h4>
                      <p className="text-xs text-gray-300 truncate">
                        {character.archetype || "No archetype set"}
                      </p>
                      {character.backstory_one_sentence && (
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {character.backstory_one_sentence.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCharacter(index);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Character Details Panel */}
        <div className="flex-1">
          {selectedCharacter !== null && characters[selectedCharacter] ? (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Character Details: {characters[selectedCharacter].name || `Character ${selectedCharacter + 1}`}
                </h3>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <CollapsibleSection title="Basic Information" icon="📝" sectionKey="basic" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextInput
                      label="Character Name *"
                      field="name"
                      placeholder="Enter character name"
                      characterIndex={selectedCharacter}
                    />
                    <Select
                      label="Character Archetype"
                      field="archetype"
                      options={archetypes}
                      characterIndex={selectedCharacter}
                    />
                    <div className="md:col-span-2">
                      <TextArea
                        label="Backstory in One Sentence"
                        field="backstory_one_sentence"
                        placeholder="A compelling one-sentence backstory that defines this character"
                        characterIndex={selectedCharacter}
                      />
                    </div>
                    <TextArea
                      label="Internal Conflict"
                      field="internal_conflict"
                      placeholder="What do they struggle with emotionally or morally?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="External Conflict"
                      field="external_conflict"
                      placeholder="Who or what opposes them physically or socially?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Relationships Map"
                      field="relationships_map"
                      placeholder="e.g., 'Enemies with X', 'Secretly loves Y', 'Owes life to Z'"
                      characterIndex={selectedCharacter}
                    />
                    <TextInput
                      label="Personal Symbol / Object"
                      field="personal_symbol_object"
                      placeholder="e.g., a pocket watch, a tattoo, a necklace from childhood"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Psychological & Emotional Layers */}
                <CollapsibleSection title="Psychological & Emotional Layers" icon="🧠" sectionKey="psychological" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextArea
                      label="Core Belief"
                      field="core_belief"
                      placeholder="What do they believe about themselves or the world?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Emotional Triggers"
                      field="emotional_triggers"
                      placeholder="What pisses them off, breaks them down, or sends them spiraling?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Comfort Zones"
                      field="comfort_zones"
                      placeholder="What makes them feel safe or in control?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Coping Mechanism"
                      field="coping_mechanism"
                      placeholder="How do they deal with stress? Drinking? Joking? Violence? Silence?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Desire vs. Need"
                      field="desire_vs_need"
                      placeholder="What do they think they want vs. what they actually need to grow?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Biggest Regret"
                      field="biggest_regret"
                      placeholder="One moment they'd undo if they could"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Emotional Armor"
                      field="emotional_armor"
                      placeholder="How do they protect themselves emotionally (humor, isolation, control)?"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Life & Past Impact */}
                <CollapsibleSection title="Life & Past Impact" icon="📚" sectionKey="past" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextArea
                      label="Defining Childhood Moment"
                      field="defining_childhood_moment"
                      placeholder="One thing that shaped who they are today"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="First Major Betrayal"
                      field="first_major_betrayal"
                      placeholder="When did they learn not to trust easily?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Past Love or Loss"
                      field="past_love_or_loss"
                      placeholder="Is there someone they never got over?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Family Role / Dynamic"
                      field="family_role_dynamic"
                      placeholder="Were they the golden child? The scapegoat? The forgotten middle?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Education / Street Smarts"
                      field="education_street_smarts"
                      placeholder="Not just degrees — but what kind of 'life lessons' shaped them?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Criminal Record / Secret Past"
                      field="criminal_record_secret"
                      placeholder="If you wanna spice things up. Doesn't have to be literal crime."
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Dark Corners / Moral Edges */}
                <CollapsibleSection title="Dark Corners / Moral Edges" icon="🌑" sectionKey="dark" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextArea
                      label="Line They'll Never Cross"
                      field="line_never_cross"
                      placeholder="What's their hard moral limit — and will the plot test it?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Worst Thing They've Done"
                      field="worst_thing_done"
                      placeholder="Doesn't have to be public. Just something they think is unforgivable."
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Justification for Wrongdoing"
                      field="justification_wrongdoing"
                      placeholder="If they had to hurt someone, how would they explain it to themselves?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Their Own Villain Origin"
                      field="villain_origin"
                      placeholder="What would make this character snap and turn into the bad guy?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="How They'd Destroy Themselves"
                      field="self_destruction_method"
                      placeholder="What self-sabotaging trait could take them down?"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Social Dynamics & Behavior */}
                <CollapsibleSection title="Social Dynamics & Behavior" icon="👫" sectionKey="social" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextArea
                      label="Public Persona vs. Private Self"
                      field="public_vs_private_persona"
                      placeholder="How do they present vs. who they really are?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Role in Their Group / Circle"
                      field="role_in_group"
                      placeholder="Leader, follower, glue, rebel, clown, ghost?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Love Language / Attachment Style"
                      field="love_language_attachment"
                      placeholder="Secure, anxious, avoidant? How do they handle intimacy?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="How They Treat the Weak / Powerless"
                      field="treats_weak_powerless"
                      placeholder="Always reveals real character. Compassion or cruelty?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Jealousy Triggers"
                      field="jealousy_triggers"
                      placeholder="What makes them insecure or envious?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Loyalty Level"
                      field="loyalty_level"
                      placeholder="Do they stay loyal to people, principles, or themselves?"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Quirks, Habits & Humanity */}
                <CollapsibleSection title="Quirks, Habits & Humanity" icon="😊" sectionKey="quirks" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextInput
                      label="Weird Habit"
                      field="weird_habit"
                      placeholder="Collects receipts. Taps three times before opening a door."
                      characterIndex={selectedCharacter}
                    />
                    <TextInput
                      label="Physical Tics or Gestures"
                      field="physical_tics_gestures"
                      placeholder="Bites lip when lying. Cracks knuckles before a fight."
                      characterIndex={selectedCharacter}
                    />
                    <TextInput
                      label="Obsessions / Hobbies"
                      field="obsessions_hobbies"
                      placeholder="Chess, old songs, antique knives — random stuff they care about hard"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Voice / Speech Pattern"
                      field="voice_speech_pattern"
                      placeholder="Do they curse a lot? Talk in metaphors? Whisper? Over-explain?"
                      characterIndex={selectedCharacter}
                    />
                    <TextInput
                      label="What Makes Them Laugh"
                      field="what_makes_laugh"
                      placeholder="Silly, dark humor, dry sarcasm?"
                      characterIndex={selectedCharacter}
                    />
                    <TextInput
                      label="What Makes Them Cry"
                      field="what_makes_cry"
                      placeholder="Are they emotionally numb? Do they cry when angry?"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Narrative Design Tools */}
                <CollapsibleSection title="Narrative Design Tools" icon="🎯" sectionKey="narrative" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextInput
                      label="Symbol or Color Motif"
                      field="symbol_color_motif"
                      placeholder="Maybe red means blood for them. Maybe feathers mean freedom."
                      characterIndex={selectedCharacter}
                    />
                    <TextInput
                      label="Their Arc in One Word"
                      field="arc_in_one_word"
                      placeholder="'Redemption,' 'Corruption,' 'Freedom,' 'Self-Acceptance' etc."
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Theme Connection"
                      field="theme_connection"
                      placeholder="How do they reinforce or challenge the story's core moral?"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="When They Peak / Collapse"
                      field="when_peak_collapse"
                      placeholder="Rough idea of when their personal climax or breakdown happens"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="What Their Ending Should Feel Like"
                      field="ending_feel"
                      placeholder="Not what happens, but what vibe. Bittersweet? Justified? Haunting?"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Deep Psychology (Advanced) */}
                <CollapsibleSection title="Deep Psychology (Advanced)" icon="🔬" sectionKey="deeppsych" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextArea
                      label="Core Belief About Self"
                      field="psychological_layers.core_belief_self"
                      placeholder="'I'm unworthy of love.' / 'I have to stay in control.'"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Core Belief About the World"
                      field="psychological_layers.core_belief_world"
                      placeholder="'People only care about power.' / 'The world is chaos.'"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Unconscious Fear"
                      field="psychological_layers.unconscious_fear"
                      placeholder="Something they're not even aware they're afraid of"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Source of Shame"
                      field="psychological_layers.source_of_shame"
                      placeholder="Not just guilt — but shame. Deep, hidden, and possibly irrational."
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Recurring Negative Thought"
                      field="psychological_layers.recurring_negative_thought"
                      placeholder="'You're just pretending.' / 'They're all going to leave.'"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="What They'd Never Admit Out Loud"
                      field="psychological_layers.never_admit_out_loud"
                      placeholder="'I'm afraid I'll never be enough.'"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Mental Health & Trauma (Optional) */}
                <CollapsibleSection title="Mental Health & Trauma (Optional)" icon="🩹" sectionKey="mentalhealth" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextArea
                      label="Mental Health Tags"
                      field="psychological_layers.mental_health_tags"
                      placeholder="PTSD, dissociation, perfectionism, anxiety disorder, compulsive lying, etc."
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Trauma Response Style"
                      field="psychological_layers.trauma_response_style"
                      placeholder="Fight / Flight / Freeze / Fawn — or complex combinations"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Memory Triggers"
                      field="psychological_layers.memory_triggers"
                      placeholder="Certain scents, songs, names, phrases that activate trauma or nostalgia"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Inner Monologue Style"
                      field="psychological_layers.inner_monologue_style"
                      placeholder="Logical? Poetic? Childlike? Cruel? Chaotic? Self-blaming?"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>

                {/* Plot Utility (Optional) */}
                <CollapsibleSection title="Plot Utility (Optional)" icon="⚙️" sectionKey="plotutil" characterIndex={selectedCharacter}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextInput
                      label="Where They Appear (Chapters)"
                      field="where_they_appear_chapters"
                      placeholder="e.g., 'Chapters 1-5, 8-10' or 'Throughout'"
                      characterIndex={selectedCharacter}
                    />
                    <TextInput
                      label="Plot Role Tag"
                      field="plot_role_tag"
                      placeholder="e.g., 'Inciting incident trigger', 'Red herring', 'Climax turner'"
                      characterIndex={selectedCharacter}
                    />
                    <TextArea
                      label="Secrets"
                      field="secrets"
                      placeholder="What they're hiding from the world — can be a juicy twist"
                      characterIndex={selectedCharacter}
                    />
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Character Selected</h3>
              <p className="text-gray-300 mb-4">
                Select a character from the list or create a new one to start building complex, compelling characters.
              </p>
              {characters.length === 0 && (
                <button
                  onClick={addCharacter}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 hover:scale-105"
                >
                  Create Your First Character
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharactersTab;