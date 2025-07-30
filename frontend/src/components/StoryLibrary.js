import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StoryLibrary = () => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API}/stories`);
      setStories(response.data);
    } catch (err) {
      setError("Error fetching stories: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) {
      return;
    }

    try {
      await axios.delete(`${API}/stories/${storyId}`);
      setStories(stories.filter(story => story.id !== storyId));
      if (selectedStory?.id === storyId) {
        setSelectedStory(null);
      }
    } catch (err) {
      setError("Error deleting story: " + (err.response?.data?.detail || err.message));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <span className="ml-3 text-white text-lg">Loading stories...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl">
        <div className="p-8 border-b border-white/20">
          <h2 className="text-3xl font-bold text-white mb-2">📚 Story Library</h2>
          <p className="text-gray-300">Your collection of AI-generated stories</p>
        </div>

        {error && (
          <div className="m-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {stories.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">No stories yet</h3>
            <p className="text-gray-300 mb-6">Start creating stories with the AI generator to build your library!</p>
            <a
              href="/"
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-200 hover:scale-105"
            >
              Create Your First Story
            </a>
          </div>
        ) : (
          <div className="flex">
            {/* Stories List */}
            <div className="w-1/3 border-r border-white/20">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Stories ({stories.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className={`p-4 rounded-lg cursor-pointer transition duration-200 ${
                        selectedStory?.id === story.id
                          ? "bg-purple-500/30 border border-purple-400/50"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <h4 className="font-medium text-white truncate mb-1">
                        {story.title}
                      </h4>
                      <p className="text-sm text-gray-300 mb-2">
                        {formatDate(story.created_at)}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {story.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Story Details */}
            <div className="flex-1">
              {selectedStory ? (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {selectedStory.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Created: {formatDate(selectedStory.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteStory(selectedStory.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white font-medium py-2 px-4 rounded-lg border border-red-500/50 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>

                  {selectedStory.prompt && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-2">Original Prompt</h4>
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-gray-200 italic">"{selectedStory.prompt}"</p>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Story Content</h4>
                    <div className="bg-white/10 rounded-lg p-6 max-h-96 overflow-y-auto">
                      <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                        {selectedStory.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStory.content);
                        alert("Story copied to clipboard!");
                      }}
                      className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 hover:scale-105"
                    >
                      Copy Story
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([selectedStory.content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedStory.title}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200 hover:scale-105"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-4">👈</div>
                    <p className="text-gray-300">Select a story from the list to view its details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryLibrary;