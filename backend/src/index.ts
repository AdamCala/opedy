import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { FtpSrv, FtpServerOptions } from 'ftp-srv';

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 3000; // Ensure port is a number
const videosDirectory = '/resources/videos';
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const ftpPort: number = Number(process.env.FTP_PORT) || 21; // Ensure ftpPort is a number
const ftpPasvPort: number = Number(process.env.FTP_PASV_PORT) || 4500; // Ensure ftpPasvPort is a number
const ftpRoot = process.env.FTP_ROOT || '/path/to/ftp/root';

// Initialize FTP server
const ftpServerOptions: FtpServerOptions = {
  url: `ftp://127.0.0.1:${ftpPort}`,
  pasv_url: `ftp://127.0.0.1:${ftpPasvPort}`,
  // pasv_range: [ftpPasvPort, ftpPasvPort + 10], // Remove this line
  anonymous: true,
  greeting: "Welcome to my FTP server",
};
const ftpServer = new FtpSrv(ftpServerOptions);

app.get('/videos/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  const filePath = path.join(videosDirectory, category, filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    } else {
      // Serve the file
      const videoStream = fs.createReadStream(filePath);
      videoStream.pipe(res);
    }
  });
});

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

// Initialize FTP server and start copying videos
ftpServer.on('login', (data, resolve, reject) => {
  // You can implement authentication logic here
  resolve({ root: ftpRoot });
});

ftpServer.listen()
  .then(() => {
    console.log(`[server]: FTP server listening on port ${ftpPort}`);
  })
  .catch((err:any) => {
    console.error('Error starting FTP server:', err);
  });

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});