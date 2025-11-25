"use client";

import { useState } from "react";
import { Play, Pause, Volume2, Download, Languages } from "lucide-react";

interface StudyNoteAudioPlayerProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
}

/**
 * Study Note Audio Player Component
 * 
 * TODO: Integration with Text-to-Speech Service
 * 
 * Recommended Services:
 * 1. Google Cloud Text-to-Speech API
 * 2. Amazon Polly
 * 3. Microsoft Azure Speech Services
 * 
 * Required Implementation:
 * - POST /api/study-notes/[noteId]/generate-audio
 *   - Input: noteContent, language, voice, speed
 *   - Process: Convert text to audio using TTS API
 *   - Output: Audio file URL or base64
 * - GET /api/study-notes/[noteId]/audio
 *   - Return cached audio file
 * 
 * Features to implement:
 * - Multiple languages (English, Hindi)
 * - Voice selection (male/female)
 * - Speed control (0.5x - 2x)
 * - Audio caching for performance
 * - Download audio file option
 */
export default function StudyNoteAudioPlayer({
  noteId,
  noteTitle,
  noteContent,
}: StudyNoteAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState("en");
  const [voice, setVoice] = useState("female");
  const [speed, setSpeed] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerateAudio = async () => {
    setGenerating(true);
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/study-notes/${noteId}/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          language,
          voice,
          speed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAudioUrl(data.audioUrl);
      } else {
        alert("Audio generation not yet implemented. See StudyNoteAudioPlayer.tsx for integration details.");
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      alert("Audio generation feature requires TTS API integration. See component documentation.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioUrl) {
      handleGenerateAudio();
      return;
    }
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback
  };

  const handleDownload = () => {
    if (audioUrl) {
      // TODO: Implement audio download
      alert("Download functionality requires audio file to be generated first.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-blue-600" />
          Audio Study Notes
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
          Feature Preview
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Listen to study notes with AI-powered text-to-speech
      </p>

      {/* Language and Voice Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Languages className="inline h-4 w-4 mr-1" />
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Voice
          </label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Speed
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={generating}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {generating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Generating Audio...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="h-5 w-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Play Audio
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          disabled={!audioUrl}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download Audio"
        >
          <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Implementation Note */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>🔧 TTS Integration Required:</strong> This component needs a Text-to-Speech API integration 
          to generate audio. See <code>StudyNoteAudioPlayer.tsx</code> for implementation details.
        </p>
        <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Recommended: Google Cloud TTS, Amazon Polly, or Azure Speech</li>
          <li>Backend API endpoint: <code>/api/study-notes/[noteId]/generate-audio</code></li>
          <li>Features: Multi-language, voice selection, speed control</li>
        </ul>
      </div>
    </div>
  );
}
