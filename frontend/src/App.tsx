import { useState, useEffect } from 'react';
import './App.css';
import Player from './components/Player';
import { fetchRandomVideo, fetchVideoList } from './api';

function App() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [videoList, setVideoList] = useState<{ category: string; videos: string[] }[]>([]);

  useEffect(() => {
    console.log('Component rendered or re-rendered.');
    fetchVideoList().then(setVideoList);
  }, [videoUrl]);

  const playRandomVideo = async (category: string) => {
    const videoUrl = await fetchRandomVideo(category);
    if (videoUrl) {
      setVideoUrl(videoUrl);
    }
  };

  const playVideo = (category: string, video: string) => {
    const videoUrl = `http://localhost:5000/videos/${category}/${video}`;
    setVideoUrl(videoUrl);
  };

  return (
    <>
      <div className="video-list">
        {videoList.map((categoryVideos) => (
          <div key={categoryVideos.category}>
            <h2>{categoryVideos.category}</h2>
            <div className="video-buttons">
              {categoryVideos.videos.map((video) => (
                <button key={video} onClick={() => playVideo(categoryVideos.category, video)}>
                  Play {video}
                </button>
              ))}
              <button onClick={() => playRandomVideo(categoryVideos.category)}>Play Random</button>
            </div>
          </div>
        ))}
      </div>
      <Player key={videoUrl} videoUrl={videoUrl}/>
    </>
  );
}

export default App;
