import React, { useEffect, useState } from "react";
import { fetchWordsList } from "./apiMock";

const MAX_GUESS = 6;
const WORLD_LENGTH = 5;

const Line = ({ word, solution, showColors }) => {
  const charArray = Array(WORLD_LENGTH).fill(
    <div className="board-cell"></div>
  );

  for (let index = 0; index < word?.length; index++) {
    let cellClass = "";

    if (solution[index] === word[index]) cellClass = "correct";
    else if (solution.includes(word[index])) cellClass = "wrong-place";
    else cellClass = "incorrect";

    charArray[index] = (
      <div
        key={`char-${index}`}
        className={`board-cell ${showColors ? cellClass : ""}`}
      >
        {word[index].toUpperCase()}
      </div>
    );
  }

  return <div className="board-line">{charArray}</div>;
};

const Board = () => {
  const [board, setBoard] = useState(Array(MAX_GUESS).fill(null));
  const [currentGuess, setCurrentGuess] = useState("");
  const [solution, setSolution] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [userWon, setUserWon] = useState(false);

  useEffect(() => {
    async function fetchWords() {
      const wordList = await fetchWordsList();

      setSolution(
        wordList[Math.floor(Math.random() * wordList.length)].toLowerCase()
      );
    }

    fetchWords();
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isGameOver) return;
      const currentLineIndex = board.findIndex((line) => line === null);
      if (currentLineIndex === -1) return; // No lines to enter

      if (event.key === "Backspace") {
        if (currentGuess.length === 0) return;

        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (event.key === "Enter") {
        if (currentGuess.length < WORLD_LENGTH) return;

        setBoard((prevBoard) => {
          return prevBoard.map((line, index) => {
            return index === currentLineIndex ? currentGuess : line;
          });
        });

        if (currentGuess === solution || currentLineIndex + 1 === MAX_GUESS) {
          // if its the last guess then game over or if solution is found -> game over
          setIsGameOver(true);
          setUserWon(currentGuess === solution);
        }

        setCurrentGuess(""); // Clear typing
      }

      if (currentGuess.length === WORLD_LENGTH) return; // Word length limit reached

      const keysRegex = /^[a-z]{1}$/;
      if (event.key.match(keysRegex) === null) return; // Invalid characters

      setCurrentGuess((prev) => prev + event.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentGuess, isGameOver, solution, board]);

  return (
    <div className="board">
      {board.map((line, index) => {
        const currentLineIndex = board.findIndex((line) => line === null);
        return (
          <Line
            key={`word-${index}`}
            word={currentLineIndex === index ? currentGuess : line}
            solution={solution}
            showColors={index < currentLineIndex || currentLineIndex === -1} // Show previous guesses and if board is full
          />
        );
      })}
      <div className={`overlay ${isGameOver ? "show" : ""}`}>
        <h1>Game over: You {userWon ? "won" : "lost"}</h1>
        <div className="solution">Correct Answer: {solution.toUpperCase()}</div>
        <button
          className="refresh-btn"
          onClick={() => window.location.reload()}
        >
          Replay
        </button>
      </div>
      <button className="refresh-btn" onClick={() => window.location.reload()}>
        Refresh Game
      </button>
    </div>
  );
};

export default Board;
