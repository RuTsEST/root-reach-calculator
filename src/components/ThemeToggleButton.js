import * as React from 'react';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

/**
 * Compact header control: flips light ↔ dark.
 * Uses the effective mode so a system-default app still toggles correctly.
 */
export function ThemeToggleButton({ mode, onToggle }) {
    const isDark = mode === 'dark';
    return (
        <IconButton
            onClick={onToggle}
            size="small"
            aria-label={isDark ? 'switch to light mode' : 'switch to dark mode'}
            data-cy="theme-toggle"
        >
            {isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
        </IconButton>
    );
}
