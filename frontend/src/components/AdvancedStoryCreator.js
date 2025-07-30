import { useState, useEffect } from "react";
import axios from "axios";
import WorldbuildingTab from "./WorldbuildingTab";
import CharactersTab from "./CharactersTab";
import PlotTab from "./PlotTab";
import GenerationDashboard from "./GenerationDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdvancedStoryCreator = () => {
  const [activeTab, setActiveTab] = useState("worldbuilding");
  const [projectData, setProjectData] = useState({
    title: "",
    target_chapters: 10,
    target_words_per_chapter: 2000,
    worldbuilding: {},
    characters: [],
    plot_utility: {}
  });
  const [projectId, setProjectId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedProject, setSavedProject] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tab definitions
  const tabs = [
    { id: "worldbuilding", name: "🌍 Worldbuilding", icon: "🌍" },
    { id: "characters", name: "👥 Characters", icon: "👥" },
    { id: "plot", name: "📋 Plot Structure", icon: "📋" },
    { id: "generation", name: "⚡ Generation", icon: "⚡" }
  ];

  // Calculate total estimated words
  const estimatedWords = projectData.target_chapters * projectData.target_words_per_chapter;

  const updateProjectData = (section, data) => {
    setProjectData(prev => ({
      ...prev,
      [section]: data
    }));
    setSavedProject(false);
  };

  const saveProject = async () => {
    if (!projectData.title.trim()) {
      setError("Please enter a project title");
      return;
    }

    try {
      if (projectId) {
        // Update existing project
        const response = await axios.put(`${API}/projects/${projectId}`, projectData);
        setSuccess("Project updated successfully!");
      } else {
        // Create new project
        const response = await axios.post(`${API}/projects`, projectData);
        setProjectId(response.data.id);
        setSuccess("Project created successfully!");
      }
      setSavedProject(true);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error saving project: " + (err.response?.data?.detail || err.message));
    }
  };

  const startGeneration = async () => {
    if (!projectId) {
      setError("Please save the project first");
      return;
    }

    try {
      setIsGenerating(true);
      await axios.post(`${API}/projects/${projectId}/generate`);
      setActiveTab("generation");
    } catch (err) {
      setError("Error starting generation: " + (err.response?.data?.detail || err.message));
      setIsGenerating(false);
    }
  };

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition duration-200 ${
        isActive
          ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg"
          : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
      }`}
    >
      <span className="text-lg">{tab.icon}</span>
      <span>{tab.name}</span>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ⚡ Advanced Story Creator
            </h1>
            <p className="text-gray-300">
              Create complex, multi-agent generated stories with full creative control
            </p>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-400/30">
              <div className="text-white font-semibold">Story Metrics</div>
              <div className="text-sm text-gray-300">
                {projectData.target_chapters} chapters × {projectData.target_words_per_chapter} words
              </div>
              <div className="text-lg font-bold text-purple-300">
                ~{estimatedWords.toLocaleString()} total words
              </div>
            </div>
          </div>
        </div>

        {/* Project Title and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={projectData.title}
              onChange={(e) => updateProjectData("title", e.target.value)}
              placeholder="Enter your story title..."
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Target Chapters
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={projectData.target_chapters}
              onChange={(e) => updateProjectData("target_chapters", parseInt(e.target.value) || 10)}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Words per Chapter
            </label>
            <input
              type="number"
              min="500"
              max="5000"
              step="100"
              value={projectData.target_words_per_chapter}
              onChange={(e) => updateProjectData("target_words_per_chapter", parseInt(e.target.value) || 2000)}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={saveProject}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-200 hover:scale-105"
          >
            {projectId ? "Update Project" : "Save Project"}
          </button>
          
          {savedProject && (
            <button
              onClick={startGeneration}
              disabled={isGenerating}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "🚀 Generate Full Story"}
            </button>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl min-h-[600px]">
        {activeTab === "worldbuilding" && (
          <WorldbuildingTab
            data={projectData.worldbuilding}
            onUpdate={(data) => updateProjectData("worldbuilding", data)}
          />
        )}
        
        {activeTab === "characters" && (
          <CharactersTab
            data={projectData.characters}
            onUpdate={(data) => updateProjectData("characters", data)}
          />
        )}
        
        {activeTab === "plot" && (
          <PlotTab
            data={projectData.plot_utility}
            onUpdate={(data) => updateProjectData("plot_utility", data)}
          />
        )}
        
        {activeTab === "generation" && (
          <GenerationDashboard
            projectId={projectId}
            isGenerating={isGenerating}
            onGenerationComplete={() => setIsGenerating(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedStoryCreator;