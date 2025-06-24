import { Download, Upload } from 'lucide-react';

interface RecordingPreviewProps {
  currentRecording: Blob;
  recordingMode: 'audio' | 'video';
  downloadRecording: () => void;
  saveRecording: () => void;
}

const RecordingPreview: React.FC<RecordingPreviewProps> = ({
  currentRecording,
  recordingMode,
  downloadRecording,
  saveRecording
}) => (
  <div className="bg-white/10 rounded-xl p-6 mb-6">
    <h3 className="text-white text-lg font-semibold mb-4">Recording Preview</h3>

    {recordingMode === 'video' ? (
      <video
        controls
        src={URL.createObjectURL(currentRecording)}
        className="w-full max-w-2xl mx-auto rounded-lg mb-4"
      />
    ) : (
      <div className="flex items-center justify-center mb-4">
        <audio
          controls
          src={URL.createObjectURL(currentRecording)}
          className="w-full max-w-md"
        />
      </div>
    )}

    <div className="flex justify-center gap-4">
      <button
        onClick={downloadRecording}
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
      >
        <Download size={20} />
        Download
      </button>
      <button
        onClick={saveRecording}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
      >
        <Upload size={20} />
        Save to Library
      </button>
    </div>
  </div>
);

export default RecordingPreview;
