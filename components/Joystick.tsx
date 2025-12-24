import React, { useEffect, useRef, useState } from 'react';
import { JoystickData } from '../types';

interface JoystickProps {
  onMove: (data: JoystickData) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const touchId = useRef<number | null>(null);

  // Configuration
  const maxRadius = 40;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleStart = (e: TouchEvent | MouseEvent) => {
      e.preventDefault(); 
      e.stopPropagation();
      setActive(true);
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if ('touches' in e) touchId.current = e.touches[0].identifier;

      updateStick(clientX, clientY);
    };

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!active) return;
      // We do NOT stop propagation here for window events to ensure other touches 
      // (like camera rotation on the other side of screen) might still be processed by other listeners if needed.
      // However, preventDefault is good to stop scrolling.
      if (e.cancelable) e.preventDefault(); 

      let clientX, clientY;
      
      if ('touches' in e) {
        const touch = Array.from(e.touches).find(t => t.identifier === touchId.current);
        if (!touch) return; // This movement isn't for the joystick
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      updateStick(clientX, clientY);
    };

    const handleEnd = (e: TouchEvent | MouseEvent) => {
      // Only end if the specific touch ended, or if it's mouse
      if ('touches' in e) {
         const touchEnded = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
         if (!touchEnded) return;
      }

      setActive(false);
      touchId.current = null;
      if (stickRef.current) {
        stickRef.current.style.transform = `translate(0px, 0px)`;
      }
      onMove({ x: 0, y: 0, active: false });
    };

    const updateStick = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Clamp distance
      if (distance > maxRadius) {
        const ratio = maxRadius / distance;
        dx *= ratio;
        dy *= ratio;
      }

      if (stickRef.current) {
        stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      // Normalize output -1 to 1
      onMove({
        x: dx / maxRadius,
        y: -dy / maxRadius,
        active: true
      });
    };

    container.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    container.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      container.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      container.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [active, onMove]);

  return (
    <div className="absolute bottom-8 left-8 z-50 touch-none">
      {/* Background Circle */}
      <div 
        ref={containerRef}
        className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center cursor-pointer"
        style={{ touchAction: 'none' }}
      >
        {/* Stick */}
        <div 
          ref={stickRef}
          className={`w-12 h-12 bg-white rounded-full shadow-lg transition-colors duration-200 pointer-events-none ${active ? 'bg-green-400' : 'bg-white'}`}
        />
      </div>
    </div>
  );
};
