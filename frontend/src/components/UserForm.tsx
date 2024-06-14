import React, { useState } from 'react';

interface Player {
  username: string;
  score: string;
  matchingUsernames: string[];
}

interface UserFormProps {
  currentOpName: string;
  currentDifficulty: string;
}

const UserForm: React.FC<UserFormProps> = ({ currentOpName, currentDifficulty }) => {
  const [players, setPlayers] = useState<Player[]>([
    { username: '', score: '1', matchingUsernames: [] },
    { username: '', score: '1', matchingUsernames: [] },
    { username: '', score: '1', matchingUsernames: [] }
  ]);

  const handleUsernameChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = event.target.value;
    const updatedPlayers = [...players];
    updatedPlayers[index].username = value;
    setPlayers(updatedPlayers);

    try {
      const response = await fetch(`http://localhost:5000/autocomplete?username_prefix=${value}`);
      if (response.ok) {
        const data = await response.json();
        updatedPlayers[index].matchingUsernames = data;
        setPlayers(updatedPlayers);
      } else {
        throw new Error('Failed to fetch matching usernames.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUsernameSelect = (selectedUsername: string, index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].username = selectedUsername;
    updatedPlayers[index].matchingUsernames = [];
    setPlayers(updatedPlayers);
  };

  const handleScoreChange = (event: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const value = event.target.value;
    const updatedPlayers = [...players];
    updatedPlayers[index].score = value;
    setPlayers(updatedPlayers);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append('op_name', currentOpName); // Add op_name to the form data
      formData.append('difficulty', currentDifficulty);

      players.forEach((player, index) => {
        formData.append(`username_${index + 1}`, player.username);
        formData.append(`score_${index + 1}`, player.score);
      });

      await fetch('http://localhost:5000/add_scores', {
        method: 'POST',
        body: formData
      });

      // Redirect back to the home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <h1>Add Scores</h1>
      <form onSubmit={handleSubmit}>
        {players.map((player, index) => (
          <div key={index}>
            <label htmlFor={`username_${index}`}>Username {index + 1}:</label>
            <input
              type="text"
              id={`username_${index}`}
              name={`username_${index}`}
              value={player.username}
              onChange={(event) => handleUsernameChange(event, index)}
              autoComplete="off"
            />
            {player.matchingUsernames.length > 0 && (
              <ul>
                {player.matchingUsernames.map((username) => (
                  <li key={username} onClick={() => handleUsernameSelect(username, index)}>{username}</li>
                ))}
              </ul>
            )}
            <br /><br />
            <label htmlFor={`score_${index}`}>Score {index + 1}:</label>
            <select
              id={`score_${index}`}
              name={`score_${index}`}
              value={player.score}
              onChange={(event) => handleScoreChange(event, index)}
              required
            >
              <option value="1">1 Point</option>
              <option value="0">No Point</option>
            </select>
            <br /><br />
          </div>
        ))}
        <label htmlFor="difficulty">Difficulty:</label>
        <input type="text" id="difficulty" name="difficulty" value={currentDifficulty} readOnly />
        <br /><br />
        {currentOpName && players.every(player => player.username) ? (
          <button type="submit">Add Scores</button>
        ) : (
          <button type="submit" disabled>Add Scores</button>
        )}
      </form>
    </div>
  );
};

export default UserForm;
