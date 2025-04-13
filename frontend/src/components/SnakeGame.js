'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './SnakeGame.module.css';

const GRID_SIZE = 32;
const CELL_SIZE = 10;
const INITIAL_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
  const [food, setFood] = useState({ x: 4, y: 4 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef();
  const speedRef = useRef(INITIAL_SPEED);

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    setFood(newFood);
  };

  const checkCollision = (head) => {
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Check self collision
    for (let i = 0; i < snake.length - 1; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return false;
  };

  const moveSnake = () => {
    const head = { ...snake[0] };

    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      default:
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    const newSnake = [head];
    if (head.x === food.x && head.y === food.y) {
      setScore(score + 1);
      generateFood();
      newSnake.push(...snake);
      // Increase speed slightly
      speedRef.current = Math.max(50, speedRef.current - 5);
    } else {
      newSnake.push(...snake.slice(0, -1));
    }

    setSnake(newSnake);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    if (!gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speedRef.current);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [snake, food, gameOver]);

  const resetGame = () => {
    setSnake([{ x: 8, y: 8 }]);
    setFood({ x: 4, y: 4 });
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    speedRef.current = INITIAL_SPEED;
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <div className={styles.score}>Score: {score}</div>
      </div>
      <div 
        className={styles.gameBoard}
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className={styles.snakeSegment}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE
            }}
          />
        ))}
        <div
          className={styles.food}
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE
          }}
        />
      </div>
      {gameOver && (
        <div className={styles.gameOver}>
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;