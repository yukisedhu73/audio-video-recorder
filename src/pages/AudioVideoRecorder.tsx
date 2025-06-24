import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import ModeToggle from './../components/ModeToggle';
import RecorderControls from './../components/RecorderControls';
import RecordingPreview from './../components/RecordingPreview';
import RecordingsLibrary from './../components/RecordingsLibrary';

interface Recording {
  id: string;
  name: string;
  blob: Blob;
  type: 'audio' | 'video';
  duration: number;
  createdAt: Date;
}

const AudioVideoRecorder: React.FC = () => {
  const [recordingMode, setRecordingMode] = useState<'audio' | 'video'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<Blob | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const requestPermissions = async () => {
    try {
      const constraints = recordingMode === 'video'
        ? { audio: true, video: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (recordingMode === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      setPermissionError(null);
      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission denied';
      setPermissionError(`Unable to access ${recordingMode}: ${errorMessage}`);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await requestPermissions();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingMode === 'video' ? 'video/webm' : 'audio/webm'
        });
        setCurrentRecording(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isPaused ? mediaRecorderRef.current.resume() : mediaRecorderRef.current.pause();
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const downloadRecording = (blob: Blob, filename?: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveRecording = () => {
    if (currentRecording) {
      const newRecording: Recording = {
        id: Date.now().toString(),
        name: `${recordingMode} Recording ${new Date().toLocaleString()}`,
        blob: currentRecording,
        type: recordingMode,
        duration: recordingTime,
        createdAt: new Date()
      };
      setRecordings(prev => [...prev, newRecording]);
      setCurrentRecording(null);
      setRecordingTime(0);
    }
  };

  const playRecording = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob);

    const modal = document.createElement('div');
    modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); display: flex; align-items: center;
    justify-content: center; z-index: 1000; padding: 20px;
  `;

    const container = document.createElement('div');
    container.style.cssText = 'position: relative; max-width: 90vw; max-height: 90vh; min-width: 60%; background: white; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; align-items: center;';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
    position: absolute; top: -10px; right: -10px; background: white;
    border: none; border-radius: 50%; width: 30px; height: 30px;
    cursor: pointer; font-size: 20px; z-index: 1001;
  `;

    closeBtn.onclick = () => {
      document.body.removeChild(modal);
      URL.revokeObjectURL(url);
    };

    if (recording.type === 'video') {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      video.style.maxWidth = '100%';
      video.style.borderRadius = '8px';
      container.appendChild(video);
    } else {
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = true;
      audio.autoplay = true;
      audio.style.width = '100%';
      audio.onended = () => {
        setIsPlaying(prev => ({ ...prev, [recording.id]: false }));
        URL.revokeObjectURL(url);
      };
      setIsPlaying(prev => ({ ...prev, [recording.id]: true }));
      container.appendChild(audio);

      const playingText = document.createElement('div');
      playingText.innerText = 'Now Playing';
      playingText.style.cssText = 'margin-top: 10px; font-weight: 500; color: #4ade80;';
      container.appendChild(playingText);
    }

    container.appendChild(closeBtn);
    modal.appendChild(container);
    document.body.appendChild(modal);

    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        URL.revokeObjectURL(url);
      }
    };
  };


  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-30% to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Media Recorder</h1>
          <p className="text-blue-200">Record audio and video</p>
        </div>

        {/* Mode Toggle */}
        <ModeToggle recordingMode={recordingMode} setRecordingMode={setRecordingMode} />

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          {/* Video Preview */}
          {recordingMode === 'video' && (
            <div className="mb-6">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full max-w-2xl mx-auto rounded-xl bg-black/20"
                style={{ aspectRatio: '16/9' }}
              />
            </div>
          )}

          {/* Timer */}
          {(isRecording || currentRecording) && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock size={16} className="text-red-400" />
                <span className="text-white font-mono text-lg">{formatTime(recordingTime)}</span>
                {isRecording && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </div>
            </div>
          )}

          {/* Controls */}
          <RecorderControls
            recordingMode={recordingMode}
            isRecording={isRecording}
            isPaused={isPaused}
            onStart={startRecording}
            onPause={pauseRecording}
            onStop={stopRecording}
          />

          {/* Preview */}
          {currentRecording && (
            <RecordingPreview
              currentRecording={currentRecording}
              recordingMode={recordingMode}
              downloadRecording={() => downloadRecording(currentRecording)}
              saveRecording={saveRecording}
            />
          )}

          {/* Error */}
          {permissionError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-200">{permissionError}</p>
            </div>
          )}
        </div>

        {/* Saved Recordings */}
        {recordings.length > 0 && (
          <RecordingsLibrary
            recordings={recordings}
            isPlaying={isPlaying}
            playRecording={playRecording}
            downloadRecording={downloadRecording}
            deleteRecording={deleteRecording}
            formatTime={formatTime}
          />
        )}
      </div>
    </div>
  );
};

export default AudioVideoRecorder;
