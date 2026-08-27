'use client';

import * as React from 'react';
import type { AdLibraryBoard } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface SavedBoardsProps {
  boards: AdLibraryBoard[];
  active: string | null;
  onSelect: (board: string | null) => void;
}

const CHIP =
  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50';

export function SavedBoards({ boards, active, onSelect }: SavedBoardsProps) {
  const total = boards.reduce((sum, b) => sum + b.count, 0);

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Saved boards"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={active === null}
        className={cn(
          CHIP,
          active === null
            ? 'border-primary/40 bg-primary text-white dark:text-white'
            : 'border-border bg-muted text-muted-foreground hover:text-foreground',
        )}
      >
        All saved
        <span className="ml-1.5 tabular-nums opacity-70">{total}</span>
      </button>

      {boards.map((board) => (
        <button
          key={board.board}
          type="button"
          onClick={() => onSelect(board.board)}
          aria-pressed={active === board.board}
          className={cn(
            CHIP,
            active === board.board
              ? 'border-primary/40 bg-primary text-white dark:text-white'
              : 'border-border bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          {board.board}
          <span className="ml-1.5 tabular-nums opacity-70">{board.count}</span>
        </button>
      ))}
    </div>
  );
}

export default SavedBoards;
