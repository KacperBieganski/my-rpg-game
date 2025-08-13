import React, { useCallback, useRef } from "react";
import GameCanvas from "./GameCanvas";

const GameScreen: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    const elem = wrapperRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, []);

  return (
    <div
      className="game-and-ui-wrapper"
      ref={wrapperRef}
      style={{ position: "relative" }}
    >
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "5px",
          zIndex: 10000,
          padding: "6px 12px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ⛶ Pełny ekran
      </button>

      <GameCanvas />
    </div>
  );
};

export default GameScreen;
