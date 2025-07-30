import { useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StoryGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedStory, setGeneratedStory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const generateStory = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story prompt");
      return;
    }

    setIsLoading(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await axios.post(`${API}/generate-story`, {
        prompt,
        max_tokens: 1000,
        temperature: 0.7
      });

      if (response.data.success) {
        setGeneratedStory(response.data.story);
      } else {
        setError("Failed to generate story");
      }
    } catch (err) {
      setError("Error generating story: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const completeStory = async () => {
    if (!generatedStory.trim()) {
      setError("No story to complete");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/complete-story`, {
        prompt: generatedStory,
        max_tokens: 500,
        temperature: 0.7
      });

      if (response.data.success) {
        setGeneratedStory(generatedStory + "\n\n" + response.data.completion);
      } else {
        setError("Failed to complete story");
      }
    } catch (err) {
      setError("Error completing story: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const saveStory = async () => {
    if (!generatedStory.trim() || !storyTitle.trim()) {
      setError("Please provide both a title and story content");
      return;
    }

    try {
      const response = await axios.post(`${API}/stories`, {
        title: storyTitle,
        content: generatedStory,
        prompt: prompt
      });

      if (response.data) {
        setSavedMessage("Story saved successfully!");
        setStoryTitle("");
        setTimeout(() => setSavedMessage(""), 3000);
      }
    } catch (err) {
      setError("Error saving story: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          ✨ AI Story Generator
        </h2>
        
        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            Story Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your story idea here... (e.g., 'A brave knight discovers a magical forest')"
            className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
            rows="4"
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={generateStory}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating...
              </div>
            ) : (
              "Generate Story"
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
            {savedMessage}
          </div>
        )}

        {/* Generated Story */}
        {generatedStory && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Generated Story</h3>
              <div className="flex space-x-3">
                <button
                  onClick={completeStory}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 hover:scale-105 disabled:opacity-50"
                >
                  Continue Story
                </button>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 mb-4">
              <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                {generatedStory}
              </p>
            </div>

            {/* Save Story Section */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-lg font-medium text-white mb-3">Save Your Story</h4>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Enter story title..."
                  className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={saveStory}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow transition duration-200 hover:scale-105"
                >
                  Save Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryGenerator;