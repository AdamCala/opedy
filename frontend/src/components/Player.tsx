import React from 'react';

interface PlayerProps {
  videoUrl: string | undefined;
}

const Player: React.FC<PlayerProps> = ({ videoUrl }) => {
  return (
    <>
      {videoUrl && (
        <video width={200} autoPlay controls >
          <source src={`${videoUrl}?t=${Date.now()}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </>
  );
};

export default Player;