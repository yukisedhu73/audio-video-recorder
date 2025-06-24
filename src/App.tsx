import { Routes, Route, Navigate } from 'react-router-dom';
import AudioVideoRecorder from '../src/pages/AudioVideoRecorder';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/record" replace />} />
      <Route path="/record" element={<AudioVideoRecorder />} />
    </Routes>
  );
};

export default App;