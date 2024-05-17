import { useState, useEffect } from 'react';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import { fetchRandomVideo, fetchVideoList } from './api';
import UserForm from './components/UserForm';

function App() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [videoList, setVideoList] = useState<{ category: string; videos: string[] }[]>([]);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [nowPlaying, setNowPlaying] = useState<{ category: string; video: string } | undefined>(undefined);

  useEffect(() => {
    console.log('Component rendered or re-rendered.');
    fetchVideoList().then(setVideoList);
  }, [videoUrl]);

  const playRandomVideo = async (category: string) => {
    const videoData = await fetchRandomVideo(category);
    if (videoData) {
      setVideoUrl(videoData.url);
      setNowPlaying({ category, video: videoData.name });
    }
  };

  const playVideo = (category: string, video: string) => {
    const videoUrl = `http://localhost:5000/videos/${category}/${video}`;
    setVideoUrl(videoUrl);
    setNowPlaying({ category, video });
  };

  const filterVideos = (category: string) => {
    const searchTerm = searchTerms[category] || '';
    const categoryVideos = videoList.find(v => v.category === category);
    if (!categoryVideos) return [];
    if (searchTerm.trim() === '') return categoryVideos.videos;

    return categoryVideos.videos.filter(video =>
      video.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSearchChange = (category: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerms({
      ...searchTerms,
      [category]: event.target.value,
    });
  };

  return (
    <>
      <div className='main'>
        <div className='view'>
          <div className='info'>
            <div className="now-playing">
              {nowPlaying ? (
                <div>
                  <h2>Now Playing</h2>
                  <p>Category: {nowPlaying.category}</p>
                  <p>Video: {nowPlaying.video}</p>
                </div>
              ) : (
                <p>No video is currently playing</p>
              )}
            </div>
            <VideoPlayer key={videoUrl} videoUrl={videoUrl} />
          </div>
          <div className="video-list">
            {videoList.map((categoryVideos) => (
              <div key={categoryVideos.category}>
                <div className='controls'>
                  <h2>{categoryVideos.category}</h2>
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder={`Search ${categoryVideos.category} videos...`}
                      value={searchTerms[categoryVideos.category] || ''}
                      onChange={handleSearchChange(categoryVideos.category)}
                    />
                    <button onClick={() => playRandomVideo(categoryVideos.category)}>Play Random</button>
                  </div>
                </div>
                <div className="video-buttons">
                  {filterVideos(categoryVideos.category).map((video) => (
                    <button key={video} onClick={() => playVideo(categoryVideos.category, video)}>
                      Play {video}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='input'>
          <UserForm />
        </div>
      </div>
    </>
  );
}

export default App;
