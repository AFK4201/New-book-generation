import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StoryGenerator from "./components/StoryGenerator";
import ChatInterface from "./components/ChatInterface";
import StoryLibrary from "./components/StoryLibrary";
import AdvancedStoryCreator from "./components/AdvancedStoryCreator";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navigation = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">✨</span>
              </div>
              <h1 className="text-xl font-bold text-white">Mistral Story Maker</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Quick Generator
            </Link>
            <Link 
              to="/advanced" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30"
            >
              Advanced Creator ⚡
            </Link>
            <Link 
              to="/chat" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              AI Chat
            </Link>
            <Link 
              to="/library" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Story Library
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Home = () => {
  return <StoryGenerator />;
};

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advanced" element={<AdvancedStoryCreator />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/library" element={<StoryLibrary />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;