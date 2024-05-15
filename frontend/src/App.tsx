import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchVideo();
  }, []);

  const fetchVideo = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/random-video/cat3');
      if (response.ok) {
        console.log('ok')
        const data = await response.json();
        console.log(data);
        setVideoUrl(data.video);
      } else {
        console.log('not')
        console.error('Failed to fetch video:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      {videoUrl && (
          <video controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
