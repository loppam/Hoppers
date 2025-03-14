import { useEffect, useCallback, useState, useRef } from "react";

const GAME_HEIGHT = 300;
const GAME_WIDTH = 300;
const HOPPER_SIZE = 30;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_GAP = 140;
const GRAVITY = 0.3;
const JUMP_FORCE = -4.5;
const OBSTACLE_SPEED = 2;
const SPAWN_INTERVAL = 150;
const SCORE_INCREMENT = 0.05;

interface Obstacle {
  x: number;
  gapY: number;
  passed?: boolean;
}

interface ScorePopup {
  x: number;
  y: number;
  opacity: number;
}

export default function Hoppers() {
  const [gameStarted, setGameStarted] = useState(() => false);
  const [gameOver, setGameOver] = useState(() => false);
  const [score, setScore] = useState(() => 0);
  const [highScore, setHighScore] = useState(() => 0);
  const [hopperY, setHopperY] = useState(() => GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(() => 0);
  const [obstacles, setObstacles] = useState<Obstacle[]>(() => []);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const frameCountRef = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setHopperY(GAME_HEIGHT / 2);
    setVelocity(0);
    setObstacles([]);
    frameCountRef.current = 0;
  }, []);

  const jump = useCallback(
    (e?: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
      e?.preventDefault?.();
      if (!gameOver) {
        setVelocity(JUMP_FORCE);
      }
    },
    [gameOver]
  );

  const handleInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!gameStarted || gameOver) {
        startGame();
      } else {
        jump(e);
      }
    },
    [gameStarted, gameOver, jump, startGame]
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!gameStarted || gameOver) {
          startGame();
        } else {
          jump(e);
        }
      }
    },
    [gameStarted, gameOver, jump, startGame]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const checkCollision = useCallback(
    (hopperX: number, hopperY: number, obstacle: Obstacle) => {
      // First check if we're even near the obstacle horizontally
      if (
        hopperX + HOPPER_SIZE < obstacle.x ||
        hopperX > obstacle.x + OBSTACLE_WIDTH
      ) {
        return false;
      }

      // If we are horizontally aligned, check if we're safely in the gap
      const hopperTop = hopperY;
      const hopperBottom = hopperY + HOPPER_SIZE;

      // The gap starts at gapY and ends at gapY + OBSTACLE_GAP
      const gapTop = obstacle.gapY;
      const gapBottom = obstacle.gapY + OBSTACLE_GAP;

      // We're safe if the hopper is entirely within the gap
      const safelyInGap = hopperTop >= gapTop && hopperBottom <= gapBottom;

      return !safelyInGap;
    },
    []
  );

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Update hopper position
    setHopperY((prev) => {
      const newY = prev + velocity;
      if (newY <= 0) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, Math.floor(score)));
        return 0;
      }
      if (newY >= GAME_HEIGHT - HOPPER_SIZE) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, Math.floor(score)));
        return GAME_HEIGHT - HOPPER_SIZE;
      }
      return newY;
    });
    setVelocity((prev) => prev + GRAVITY);

    // Update score popups
    setScorePopups((prev) =>
      prev
        .map((popup) => ({
          ...popup,
          y: popup.y - 1,
          opacity: popup.opacity - 0.02,
        }))
        .filter((popup) => popup.opacity > 0)
    );

    // Update obstacles
    frameCountRef.current += 1;
    if (frameCountRef.current % SPAWN_INTERVAL === 0) {
      setObstacles((prev) => [
        ...prev,
        {
          x: GAME_WIDTH,
          gapY: Math.random() * (GAME_HEIGHT - OBSTACLE_GAP - 100) + 50,
          passed: false,
        },
      ]);
    }

    setObstacles((prev) => {
      const hopperX = 50;
      const newObstacles = prev
        .map((obs) => {
          const newObs = { ...obs, x: obs.x - OBSTACLE_SPEED };
          // Check if hopper has passed through the gap
          if (
            !obs.passed &&
            obs.x < hopperX &&
            !checkCollision(hopperX, hopperY, obs)
          ) {
            setScore((s) => s + 2); // Add bonus points
            setScorePopups((popups) => [
              ...popups,
              {
                x: hopperX + HOPPER_SIZE,
                y: hopperY,
                opacity: 1,
              },
            ]);
            newObs.passed = true;
          }
          return newObs;
        })
        .filter((obs) => obs.x > -OBSTACLE_WIDTH);

      // Check collisions
      for (const obs of newObstacles) {
        if (checkCollision(hopperX, hopperY, obs)) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, Math.floor(score)));
          break;
        }
      }

      return newObstacles;
    });

    // Update score more slowly
    setScore((prev) => prev + SCORE_INCREMENT);

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameStarted, gameOver, hopperY, velocity, checkCollision, score]);

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

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4">Hoppers</h1>

      <div
        className="relative bg-blue-100 overflow-hidden rounded-lg select-none touch-none"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      >
        {/* Score Popups */}
        {scorePopups.map((popup, index) => (
          <div
            key={index}
            className="absolute text-green-500 font-bold text-lg pointer-events-none"
            style={{
              left: popup.x,
              top: popup.y,
              opacity: popup.opacity,
              transform: "translate(-50%, -50%)",
            }}
          >
            +2
          </div>
        ))}

        {/* Hopper with hitbox visualization */}
        <div
          className="absolute bg-green-500 rounded-full transition-transform"
          style={{
            width: HOPPER_SIZE,
            height: HOPPER_SIZE,
            left: 50,
            top: hopperY,
            transform: `rotate(${velocity * 5}deg)`,
            border: "2px solid rgba(255, 255, 0, 0.5)", // Yellow border to show hitbox
          }}
        />

        {/* Obstacles with gap visualization */}
        {obstacles.map((obstacle, index) => (
          <div key={index} className="absolute" style={{ left: obstacle.x }}>
            {/* Top obstacle */}
            <div
              className="absolute bg-red-500"
              style={{
                width: OBSTACLE_WIDTH,
                height: obstacle.gapY,
                top: 0,
              }}
            />
            {/* Gap visualization */}
            <div
              className="absolute border-2 border-yellow-300 border-dashed opacity-30"
              style={{
                width: OBSTACLE_WIDTH,
                height: OBSTACLE_GAP,
                top: obstacle.gapY,
              }}
            />
            {/* Bottom obstacle */}
            <div
              className="absolute bg-red-500"
              style={{
                width: OBSTACLE_WIDTH,
                height: GAME_HEIGHT - (obstacle.gapY + OBSTACLE_GAP),
                top: obstacle.gapY + OBSTACLE_GAP,
              }}
            />
          </div>
        ))}

        {/* Game over or start screen */}
        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="text-center">
              <h2 className="text-xl font-bold">Hoppers</h2>
              <p>Press Space/Up or Tap to start</p>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="text-center">
              <h2 className="text-xl font-bold">Game Over!</h2>
              <p>Score: {Math.floor(score)}</p>
              <p>Press Space/Up or Tap to restart</p>
            </div>
          </div>
        )}

        {/* Score and High Score */}
        {gameStarted && !gameOver && (
          <>
            <div className="absolute top-2 left-2 text-xl font-bold opacity-50">
              HI: {highScore}
            </div>
            <div className="absolute top-2 right-2 text-xl font-bold">
              {Math.floor(score)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
