import { useEffect, useCallback, useState, useRef } from "react";
import sdk from "@farcaster/frame-sdk";

const GAME_HEIGHT = 300;
const GAME_WIDTH = 300;
const HOPPER_SIZE = 30;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_GAP = 100;
const GRAVITY = 0.6;
const JUMP_FORCE = -10;

interface Obstacle {
  x: number;
  gapY: number;
}

export default function Hoppers() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [hopperY, setHopperY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const gameLoopRef = useRef<number>();
  const frameCountRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setHopperY(GAME_HEIGHT / 2);
    setVelocity(0);
    setObstacles([]);
    frameCountRef.current = 0;
  }, []);

  const jump = useCallback(() => {
    if (!gameOver) {
      setVelocity(JUMP_FORCE);
    }
  }, [gameOver]);

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Update hopper position
    setHopperY((prev) => {
      const newY = prev + velocity;
      if (newY <= 0 || newY >= GAME_HEIGHT - HOPPER_SIZE) {
        setGameOver(true);
        return prev;
      }
      return newY;
    });
    setVelocity((prev) => prev + GRAVITY);

    // Update obstacles
    frameCountRef.current += 1;
    if (frameCountRef.current % 100 === 0) {
      setObstacles((prev) => [
        ...prev,
        {
          x: GAME_WIDTH,
          gapY: Math.random() * (GAME_HEIGHT - OBSTACLE_GAP),
        },
      ]);
    }

    setObstacles((prev) => {
      const newObstacles = prev
        .map((obs) => ({ ...obs, x: obs.x - 2 }))
        .filter((obs) => obs.x > -OBSTACLE_WIDTH);

      // Check collisions
      const hopperX = 50; // Fixed x position of the hopper
      newObstacles.forEach((obs) => {
        if (
          hopperX < obs.x + OBSTACLE_WIDTH &&
          hopperX + HOPPER_SIZE > obs.x &&
          (hopperY < obs.gapY ||
            hopperY + HOPPER_SIZE > obs.gapY + OBSTACLE_GAP)
        ) {
          setGameOver(true);
        }
      });

      return newObstacles;
    });

    // Update score
    setScore((prev) => prev + 1);

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameStarted, gameOver, hopperY, velocity]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, updateGame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4">Hoppers</h1>

      <div
        className="relative bg-blue-100 overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={gameStarted ? jump : startGame}
      >
        {/* Hopper */}
        <div
          className="absolute bg-green-500 rounded-full"
          style={{
            width: HOPPER_SIZE,
            height: HOPPER_SIZE,
            left: 50,
            top: hopperY,
            transition: "top 0.1s",
          }}
        />

        {/* Obstacles */}
        {obstacles.map((obstacle, index) => (
          <div key={index}>
            {/* Top obstacle */}
            <div
              className="absolute bg-red-500"
              style={{
                width: OBSTACLE_WIDTH,
                height: obstacle.gapY,
                left: obstacle.x,
                top: 0,
              }}
            />
            {/* Bottom obstacle */}
            <div
              className="absolute bg-red-500"
              style={{
                width: OBSTACLE_WIDTH,
                height: GAME_HEIGHT - obstacle.gapY - OBSTACLE_GAP,
                left: obstacle.x,
                bottom: 0,
              }}
            />
          </div>
        ))}

        {/* Game over or start screen */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="text-center">
              <h2 className="text-xl font-bold">Hoppers</h2>
              <p>Tap to start</p>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="text-center">
              <h2 className="text-xl font-bold">Game Over!</h2>
              <p>Score: {score}</p>
              <p>Tap to restart</p>
            </div>
          </div>
        )}

        {/* Score */}
        {gameStarted && !gameOver && (
          <div className="absolute top-2 right-2 text-xl font-bold">
            {score}
          </div>
        )}
      </div>
    </div>
  );
}
