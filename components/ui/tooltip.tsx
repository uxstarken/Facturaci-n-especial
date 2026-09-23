'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom';
  delayMs?: number;
}

export function Tooltip({
  content,
  children,
  className = '',
  side = 'top',
  delayMs = 80,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; side: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    side: 'top',
  });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsOpen(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;

      const spaceAbove = rect.top;
      const chosenSide = side === 'top' && spaceAbove < 60 ? 'bottom' : side;

      let top = 0;
      if (chosenSide === 'top') {
        top = rect.top + scrollY - 8;
      } else {
        top = rect.bottom + scrollY + 8;
      }

      // Clamp left position so tooltip stays within viewport
      let left = rect.left + scrollX + rect.width / 2;
      const minLeft = 140;
      const maxLeft = (typeof window !== 'undefined' ? window.innerWidth : 1200) - 140;
      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;

      setCoords({ top, left, side: chosenSide });
      setIsOpen(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-flex items-center cursor-help max-w-full ${className}`}
      >
        {children}
      </span>

      {mounted &&
        isOpen &&
        content &&
        createPortal(
          <div
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.side === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            }}
            className="fixed z-[9999] pointer-events-none max-w-xs sm:max-w-md w-max bg-gray-900/95 text-white dark:bg-slate-900/95 dark:text-gray-100 border border-purple-500/40 shadow-[0_12px_32px_rgba(0,0,0,0.35)] rounded-xl px-3 py-2 text-xs font-sans whitespace-normal break-words leading-relaxed animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ring-1 ring-white/10"
          >
            <div className="text-[11px] font-medium text-gray-200">{content}</div>
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/95 dark:bg-slate-900/95 border-purple-500/40 rotate-45 pointer-events-none ${
                coords.side === 'top'
                  ? 'bottom-[-5px] border-r border-b'
                  : 'top-[-5px] border-l border-t'
              }`}
            />
          </div>,
          document.body
        )}
    </>
  );
}

interface TruncatedTextProps {
  text: string;
  maxWidth?: string;
  className?: string;
  strikethrough?: boolean;
  prefix?: React.ReactNode;
}

export function TruncatedText({
  text,
  maxWidth = 'max-w-[140px]',
  className = '',
  strikethrough = false,
  prefix,
}: TruncatedTextProps) {
  if (!text) return null;

  return (
    <Tooltip content={text}>
      <span
        className={`truncate block ${maxWidth} ${strikethrough ? 'line-through' : ''} ${className}`}
      >
        {prefix}
        {text}
      </span>
    </Tooltip>
  );
}
