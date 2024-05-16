import ScoreboardComponent from './components/ScoreboardComponent';

const Scoreboard = () => {
  return (
    <div>
      <ScoreboardComponent difficulty="easy" />
      <ScoreboardComponent difficulty="medium" />
      <ScoreboardComponent difficulty="hard" />
      <ScoreboardComponent difficulty="top-players" />
    </div>
  );
};

export default Scoreboard;