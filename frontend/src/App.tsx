  import { useState, useEffect } from 'react';
  import './App.css';
import Player from './components/Player';

  function App() {
    const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
    const [videoList, setVideoList] = useState<{ category: string; videos: string[] }[]>([]);

    useEffect(() => {
      console.log('Component rendered or re-rendered.');
      fetchVideoList();
    }, [videoUrl]);

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

    const fetchVideoList = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/video-list');
        if (response.ok) {
          const data = await response.json();
          setVideoList(data);
        } else {
          console.error('Failed to fetch video list:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching video list:', error);
      }
    };

    const playVideo = (category: string, video: string) => {
      const videoUrl = `http://localhost:3000/videos/${category}/${video}`;
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
            </div>
          </div>
        ))}
      </div>
      <Player key={videoUrl} videoUrl={videoUrl}/>
      </>
    );
  }

  export default App;
