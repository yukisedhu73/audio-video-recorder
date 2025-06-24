import { Mic, Video } from 'lucide-react';

interface ModeToggleProps {
  recordingMode: 'audio' | 'video';
  setRecordingMode: (mode: 'audio' | 'video') => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ recordingMode, setRecordingMode }) => (
  <div className="flex justify-center mb-8">
    <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex">
      <button
        onClick={() => setRecordingMode('audio')}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
          recordingMode === 'audio'
            ? 'bg-white text-purple-900 shadow-lg'
            : 'text-white hover:bg-white/20'
        }`}
      >
        <Mic size={20} /> Audio
      </button>
      <button
        onClick={() => setRecordingMode('video')}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
          recordingMode === 'video'
            ? 'bg-white text-purple-900 shadow-lg'
            : 'text-white hover:bg-white/20'
        }`}
      >
        <Video size={20} /> Video
      </button>
    </div>
  </div>
);

export default ModeToggle;
