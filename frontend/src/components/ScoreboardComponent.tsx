import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

interface Score {
  username: string;
  score: number;
}

interface Player {
  username: string;
  games_played: number;
}

const ScoreboardComponent: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = io('http://localhost:5000');

    // Fetch initial scores from the server
    fetchScoresFromServer();

    // Set up WebSocket event listener
    socket.on('score_update', (data: any) => {
      if (difficulty !== 'top-players') {
        setScores(data[difficulty]);
      } else {
        setTopPlayers(data.top_players);
      }
    });

    // Clean up WebSocket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, [difficulty]);

  const fetchScoresFromServer = () => {
    if (difficulty !== 'top-players') {
      fetch(`http://localhost:5000/events/${difficulty}-scores`)
        .then(response => response.json())
        .then((data: Score[]) => setScores(data))
        .catch(error => console.error('Error fetching scores:', error));
    } else {
      fetchTopPlayersFromServer();
    }
  };

  const fetchTopPlayersFromServer = () => {
    fetch('http://localhost:5000/events/top-players')
      .then(response => response.json())
      .then((data: Player[]) => setTopPlayers(data))
      .catch(error => console.error('Error fetching top players:', error));
  };

  return (
    <div>
      {difficulty === 'top-players' ? (
        <div>
          <h2>Top Players (Most Played)</h2>
          <ol>
            {topPlayers.map((player, index) => (
              <li key={index}>
                {player.username}: {player.games_played} games
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div>
          <h2>{difficulty.toUpperCase()} Scores</h2>
          <ul>
            {scores.map((score, index) => (
              <li key={index}>
                {score.username}: {score.score}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScoreboardComponent;
