import { useState, useEffect } from 'react';
import './App.css';
import VideoPlayer from './components/VideoPlayer';
import { fetchRandomVideo, fetchVideoList } from './api';
import UserForm from './components/UserForm';

function App() {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [videoList, setVideoList] = useState<{ category: string; videos: string[] }[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

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

  const filterVideos = () => {
    if (searchTerm.trim() === '') {
      return videoList;
    }

    return videoList.map(categoryVideos => ({
      ...categoryVideos,
      videos: categoryVideos.videos.filter(video => video.toLowerCase().includes(searchTerm.toLowerCase()))
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const filteredVideoList = selectedCategory ? filterVideos().filter(categoryVideos => categoryVideos.category === selectedCategory) : filterVideos();

  return (
    <>
    <div className='main'>
      <div className='view'>
        <div className="search-bar">
            <input type="text" placeholder="Search videos..." value={searchTerm} onChange={handleSearchChange} />
            <select onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              {videoList.map(categoryVideos => (
                <option key={categoryVideos.category} value={categoryVideos.category}>{categoryVideos.category}</option>
              ))}
            </select>
          </div>
          <div className="video-list">
            {filteredVideoList.map((categoryVideos) => (
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
          <VideoPlayer key={videoUrl} videoUrl={videoUrl}/>
        </div>
        <div className='input'>
            <UserForm></UserForm>
        </div>
      </div>
    </>
  );
}

export default App;
