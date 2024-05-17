export const fetchRandomVideo = async (category: string) => {
  try {
    const response = await fetch(`http://localhost:5000/videos/random/${category}`);
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
      return null;
    }
    return { url: `http://localhost:5000/videos/${category}/${data.video}`, name: data.video };
  } catch (error) {
    console.error('Error fetching random video:', error);
    return null;
  }
};
  
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
  