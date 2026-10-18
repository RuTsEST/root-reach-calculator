import * as React from 'react';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import { nextThemePreference } from '../theme';

const LABELS = {
    system: 'Theme: system',
    light: 'Theme: light',
    dark: 'Theme: dark',
};

/**
 * Compact header control: cycles system → light → dark → system.
 * Icon shows the current preference (not only the resolved palette).
 */
export function ThemeToggleButton({ preference, onToggle }) {
    const next = nextThemePreference(preference);
    let icon;
    if (preference === 'dark') {
        icon = <Brightness4Icon fontSize="small" />;
    } else if (preference === 'light') {
        icon = <Brightness7Icon fontSize="small" />;
    } else {
        icon = <BrightnessAutoIcon fontSize="small" />;
    }

    return (
        <IconButton
            onClick={onToggle}
            size="small"
            aria-label={`${LABELS[preference] || LABELS.system}. Click for ${next}`}
            title={`${LABELS[preference] || LABELS.system} → ${next}`}
            data-cy="theme-toggle"
            data-theme-preference={preference}
        >
            {icon}
        </IconButton>
    );
}
