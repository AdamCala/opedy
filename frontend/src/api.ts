export async function fetchRandomVideo(category: string): Promise<string | null> {
    try {
      const response = await fetch(`http://localhost:5000/videos/random/${category}`);
      if (response.ok) {
        const data = await response.json();
        return `http://localhost:5000/videos/${category}/${data.video}`;
      } else {
        console.error('Failed to fetch video:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  }
  
  export async function fetchVideoList(): Promise<{ category: string; videos: string[] }[]> {
    try {
      const response = await fetch('http://localhost:5000/videos');
      if (response.ok) {
        const data = await response.json();
        const videoArray = Object.keys(data).map((category: string) => ({
          category,
          videos: data[category],
        }));
        return videoArray;
      } else {
        console.error('Failed to fetch video list:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error fetching video list:', error);
      return [];
    }
  }
  