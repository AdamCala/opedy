import React, { useState } from 'react';

function UserForm() {
  const [username, setUsername] = useState<string>('');
  const [matchingUsernames, setMatchingUsernames] = useState<string[]>([]);

  const handleUsernameChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUsername(value);

    try {
      const response = await fetch(`http://localhost:5000/autocomplete?username_prefix=${value}`);  
      if (response.ok) {
        const data = await response.json();
        setMatchingUsernames(data);
      } else {
        throw new Error('Failed to fetch matching usernames.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUsernameSelect = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setMatchingUsernames([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);
      await fetch('http://localhost:5000/add_score', {
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
      <h1>Add Score</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" value={username} onChange={handleUsernameChange} autoComplete="off" />
        {matchingUsernames.length > 0 && (
          <ul>
            {matchingUsernames.map((username) => (
              <li key={username} onClick={() => handleUsernameSelect(username)}>{username}</li>
            ))}
          </ul>
        )}
        <br /><br />
        <label htmlFor="difficulty">Difficulty:</label>
        <select id="difficulty" name="difficulty" required>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <br /><br />
        <label htmlFor="score">Score:</label>
        <select id="score" name="score" required>
          <option value="1">1 Point</option>
          <option value="0">No Point</option>
        </select>
        <br /><br />
        <button type="submit">Add Score</button>
      </form>
    </div>
  );
}

export default UserForm;