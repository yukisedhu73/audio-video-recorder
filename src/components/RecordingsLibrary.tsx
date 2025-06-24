import { Download, Play, Trash2, Video, Mic } from 'lucide-react';

interface Recording {
  id: string;
  name: string;
  blob: Blob;
  type: 'audio' | 'video';
  duration: number;
  createdAt: Date;
}

interface RecordingsLibraryProps {
  recordings: Recording[];
  isPlaying: { [key: string]: boolean };
  playRecording: (r: Recording) => void;
  downloadRecording: (blob: Blob, filename?: string) => void;
  deleteRecording: (id: string) => void;
  formatTime: (s: number) => string;
}

const RecordingsLibrary: React.FC<RecordingsLibraryProps> = ({
  recordings,
  isPlaying,
  playRecording,
  downloadRecording,
  deleteRecording,
  formatTime
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Your Recordings</h2>
      <div className="grid gap-4">
        {recordings.map((r) => (
          <div
            key={r.id}
            className="bg-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                {r.type === 'video' ? <Video size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
              </div>
              <div>
                <h3 className="text-white font-semibold">{r.name}</h3>
                <p className="text-blue-200 text-sm">
                  Duration: {formatTime(r.duration)} • Created: {r.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => playRecording(r)}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all"
                disabled={isPlaying[r.id]}
              >
                <Play size={16} />
              </button>
              <button
                onClick={() => downloadRecording(r.blob, r.name)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => deleteRecording(r.id)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingsLibrary;
