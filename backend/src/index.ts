import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const videosDirectory = '/resources/videos';
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';


app.use(cors()); 
app.use('/videos', (req, res, next) => {
  // Extract the file extension from the request URL
  const fileExtension = path.extname(req.url).slice(1);

  // Map the file extension to the corresponding Content-Type
  const contentTypeMap: { [key: string]: string } = {
    mp4: 'video/mp4',
    // Add more file extensions and Content-Types as needed
  };

  // Set the Content-Type header based on the file extension
  const contentType = contentTypeMap[fileExtension] || 'application/octet-stream';
  res.set('Content-Type', contentType);
  
  // Proceed to serve the static file
  next();
}, express.static(videosDirectory));

// Function to get a random video file from a category
const getRandomVideo = (category: string): string | null => {
  const categoryDirectory = path.join(videosDirectory, category);
  const files = fs.readdirSync(categoryDirectory);
  const randomIndex = Math.floor(Math.random() * files.length);
  return files[randomIndex];
};

// Function to get list of video files with their category
const getVideoList = (): { category: string; videos: string[] }[] => {
  const categories = fs.readdirSync(videosDirectory, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  return categories.map(category => {
      const categoryDirectory = path.join(videosDirectory, category);
      const videos = fs.readdirSync(categoryDirectory);
      return { category, videos };
  });
};


// Endpoint to serve a random video file from a category
app.get('/api/random-video/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  const video = getRandomVideo(category);
  if (video) {
      const videoUrl = `${baseUrl}/videos/${category}/${video}`;
      res.json({ category, video: videoUrl });
  } else {
      res.status(404).json({ error: 'No video found in the specified category' });
  }
});

// Endpoint to get list of all video files with their category
app.get('/api/video-list', (req: Request, res: Response) => {
  const videoList = getVideoList();
  res.json(videoList);
});

// Endpoint to return a specific video
app.get('/api/video/:category/:filename', (req: Request, res: Response) => {
  const { category, filename } = req.params;
  const videoUrl = `${baseUrl}/videos/${category}/${filename}`;
  res.json({ category, video: videoUrl });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});