import { Camera, Mic, Pause, Play, Square } from 'lucide-react';

interface RecorderControlsProps {
  recordingMode: 'audio' | 'video';
  isRecording: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

const RecorderControls: React.FC<RecorderControlsProps> = ({
  recordingMode,
  isRecording,
  isPaused,
  onStart,
  onPause,
  onStop
}) => (
  <div className="flex justify-center gap-4 mb-6">
    {!isRecording ? (
      <button
        onClick={onStart}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
      >
        {recordingMode === 'video' ? <Camera size={24} /> : <Mic size={24} />}
        Start Recording
      </button>
    ) : (
      <>
        <button
          onClick={onPause}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-full font-semibold transition-all"
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={onStop}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-full font-semibold transition-all"
        >
          <Square size={20} />
          Stop
        </button>
      </>
    )}
  </div>
);

export default RecorderControls;
