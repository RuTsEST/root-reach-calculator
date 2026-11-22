import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY } from './sessionStorage';
import { THEME_STORAGE_KEY } from './theme';
import { FEEDBACK_URL, REACH_LAW_URL, IS_BANNED, IS_PICKED } from './constants';

async function longPressFaction(fab) {
  fireEvent.pointerDown(fab, { pointerType: 'touch', button: 0 });
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  fireEvent.pointerUp(fab);
}

function mockMatchMedia(matchesDark) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

beforeEach(() => {
  window.sessionStorage.clear();
  mockMatchMedia(false);
});

test('reach indicator renders with initial value', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toBeInTheDocument();
  expect(indicator).toHaveTextContent('Reach: 0 / 21+');
  expect(indicator).toHaveTextContent('Below target');
});

test('header has no Pick/Ban mode toggle', () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: /^pick$/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /^ban$/i })).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/selection mode/i)).not.toBeInTheDocument();
});

test('reach indicator is red when reach is below required', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator.querySelector('.reach-values')).toHaveStyle({ color: '#b66969' });
  expect(indicator.querySelector('.reach-status')).toHaveStyle({ color: '#b66969' });
  expect(indicator).toHaveTextContent('Below target');
});

test('reach indicator turns green when reach meets required', () => {
  const { container } = render(<App />);
  // Pick enough factions to meet the 4-player threshold of 21
  // marquise(10) + duchy(8) + hundreds(9) = 27 >= 21
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="duchy"]'));
  fireEvent.click(container.querySelector('[data-cy="hundreds"]'));
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator.querySelector('.reach-values')).toHaveStyle({ color: '#4da251' });
  expect(indicator.querySelector('.reach-status')).toHaveStyle({ color: '#4da251' });
  expect(indicator).toHaveTextContent('Viable');
});

test('reach help opens explainer dialog with law link', async () => {
  const { container } = render(<App />);
  const help = container.querySelector('[data-cy="reach-help"]');
  expect(help).toBeInTheDocument();
  expect(container.querySelector('.app-header [data-cy="reach-help"]')).toBe(help);
  expect(container.querySelector('.app-footer [data-cy="reach-help"]')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /what is reach\?/i })).toBe(help);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(help);

  const dialog = await screen.findByRole('dialog');
  expect(dialog).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /^reach$/i })).toBeInTheDocument();
  expect(dialog).toHaveTextContent(/how much presence a faction has on the board/i);
  expect(dialog).toHaveTextContent(/enough Reach across everyone at the table for a balanced game/i);
  expect(dialog).not.toHaveTextContent('Using this calculator');
  expect(dialog).not.toHaveTextContent(/Viable Reach Sum/i);

  const lawLink = screen.getByRole('link', { name: /reach targets in law of root/i });
  expect(lawLink).toHaveAttribute('href', REACH_LAW_URL);
  expect(lawLink).toHaveAttribute('target', '_blank');
  expect(lawLink).toHaveAttribute('rel', expect.stringMatching(/noopener/));
  expect(lawLink).toHaveAttribute('rel', expect.stringMatching(/noreferrer/));

  fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('tap picks a faction and adds its reach to the total', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 10 / 21+');
  expect(indicator).toHaveTextContent('Below target');
});

test('tap cycles available → picked → banned → available', () => {
  const { container } = render(<App />);
  const marquise = container.querySelector('[data-cy="marquise"]');

  fireEvent.click(marquise);
  expect(marquise.querySelector('[data-cy="pick-locked"]')).toBeInTheDocument();
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 10 / 21+');

  fireEvent.click(marquise);
  expect(marquise.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');

  fireEvent.click(marquise);
  expect(marquise.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).not.toBeInTheDocument();
  expect(marquise.querySelector('[data-cy="pick-locked"]')).not.toBeInTheDocument();
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');
});

test('long-press bans available; long-press again clears ban', async () => {
  jest.useFakeTimers();
  const { container } = render(<App />);
  const marquise = container.querySelector('[data-cy="marquise"]');

  await longPressFaction(marquise);

  expect(marquise.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');

  await longPressFaction(marquise);

  expect(marquise.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).not.toBeInTheDocument();
  jest.useRealTimers();
});

test('long-press can ban a grayed-out unavailable faction', async () => {
  jest.useFakeTimers();
  const { container } = render(<App />);
  // Fill all 4 player slots so remaining factions are IS_NOT_AVAILABLE
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="duchy"]'));
  fireEvent.click(container.querySelector('[data-cy="hundreds"]'));
  fireEvent.click(container.querySelector('[data-cy="eyrie"]'));

  const alliance = container.querySelector('[data-cy="alliance"]');
  expect(alliance).toHaveAttribute('aria-disabled', 'true');
  expect(alliance).toHaveStyle({
    width: 'var(--faction-fab-size-disabled)',
    opacity: '50%',
  });
  // Slot still reserves full fab geometry so disabled shrink does not collapse rows.
  expect(alliance.closest('.faction-fab-slot')).toBeTruthy();

  // Tap does not pick unavailable
  fireEvent.click(alliance);
  expect(alliance.querySelector('[data-cy="pick-locked"]')).not.toBeInTheDocument();
  expect(alliance.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).not.toBeInTheDocument();

  await longPressFaction(alliance);

  expect(alliance.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
  expect(alliance).not.toHaveAttribute('aria-disabled');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 34 / 21+');
  jest.useRealTimers();
});

test('defaults to 4 players selected', () => {
  const { container } = render(<App />);
  expect(screen.getByRole('button', { name: /^4 players$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');
});

test('player count options are 2–6 only', () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: /^1 player$/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^2 players$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^6 players$/i })).toBeInTheDocument();
  expect(screen.queryByLabelText('Bots')).not.toBeInTheDocument();
});

test('switching player count updates Law of Root reach target', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^2 players$/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 17+');
  fireEvent.click(screen.getByRole('button', { name: /^5 players$/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 25+');
  fireEvent.click(screen.getByRole('button', { name: /^6 players$/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 28+');
});

test('legacy clockwork session keys fall back to default player4', () => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    selectedValue: '1clockwork4',
    factionStatuses: {},
  }));
  const { container } = render(<App />);
  expect(screen.getByRole('button', { name: /^4 players$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');
});

test('migrates legacy selectedValue session key to playerCountKey on write', () => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    selectedValue: 'player3',
    factionStatuses: {},
  }));
  const { container } = render(<App />);
  expect(screen.getByRole('button', { name: /^3 players$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 18+');

  fireEvent.click(screen.getByRole('button', { name: /^5 players$/i }));
  const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
  expect(stored.playerCountKey).toBe('player5');
  expect(stored.selectedValue).toBeUndefined();
  expect(stored.isBanMode).toBeUndefined();
});

test('reset button clears picked factions and returns reach to 0', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 10 / 21+');
  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 0 / 21+');
  expect(indicator).toHaveTextContent('Below target');
});

test('faction buttons expose accessible names', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: 'Marquise' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Eyrie' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Duchy' })).toBeInTheDocument();
});

test('faction cells show always-on short catalog labels', () => {
  const { container } = render(<App />);
  const labels = Array.from(container.querySelectorAll('.faction-label')).map(
    (el) => el.textContent
  );
  expect(labels).toEqual(expect.arrayContaining([
    'Marquise', 'Eyrie', 'Alliance', 'Vagabond', 'Riverfolk', 'Cult',
    'Corvid', 'Duchy', 'Vagabond 2', 'Hundreds', 'Keepers', 'Lilypad',
    'Twilight', 'Knaves',
  ]));
  expect(labels).toHaveLength(14);
  // Visible labels are decorative; a11y name stays on the fab
  expect(container.querySelector('.faction-label')).toHaveAttribute('aria-hidden', 'true');
});

test('reach indicator has aria-live for status changes', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveAttribute('aria-live', 'polite');
});

test('footer is players only (no bots, no disclaimer line)', () => {
  const { container, queryByLabelText, queryByText } = render(<App />);
  expect(container.querySelector('[data-cy="disclaimer"]')).not.toBeInTheDocument();
  expect(queryByText(/Unofficial fan tool/)).not.toBeInTheDocument();
  expect(queryByLabelText('Players')).toBeInTheDocument();
  expect(queryByLabelText('Bots')).not.toBeInTheDocument();
});

test('footer feedback link opens Discussions Ideas in a new tab', () => {
  const { container } = render(<App />);
  const link = container.querySelector('[data-cy="feedback-link"]');
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('href', FEEDBACK_URL);
  expect(link).toHaveAttribute('aria-label', 'Leave feedback on GitHub');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringMatching(/noopener/));
  expect(link).toHaveAttribute('rel', expect.stringMatching(/noreferrer/));
  expect(screen.getByRole('link', { name: /leave feedback on github/i })).toBe(link);
});

test('theme toggle lives in the footer config group next to feedback', () => {
  const { container } = render(<App />);
  const config = container.querySelector('.app-footer-config');
  const themeToggle = container.querySelector('[data-cy="theme-toggle"]');
  const feedback = container.querySelector('[data-cy="feedback-link"]');
  expect(config).toBeInTheDocument();
  expect(config).toContainElement(themeToggle);
  expect(config).toContainElement(feedback);
  expect(container.querySelector('.app-header [data-cy="theme-toggle"]')).not.toBeInTheDocument();
  expect(container.querySelector('.app-header [data-cy="random-fill"]')).toBeInTheDocument();
});

test('vagabond2 stays unavailable until vagabond1 is picked', () => {
  const { container } = render(<App />);
  const vagabond2 = container.querySelector('[data-cy="vagabond2"]');
  // Unavailable keeps pointer events for long-press ban; blocked via aria + gray-out.
  expect(vagabond2).toHaveAttribute('aria-disabled', 'true');

  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="vagabond1"]'));
  expect(container.querySelector('[data-cy="vagabond1"]')).not.toHaveAttribute('aria-disabled');
  expect(container.querySelector('[data-cy="vagabond2"]')).not.toHaveAttribute('aria-disabled');

  fireEvent.click(container.querySelector('[data-cy="vagabond2"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 17 / 21+');
});

test('picking a vagabond makes knaves unavailable', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="vagabond1"]'));

  const knaves = container.querySelector('[data-cy="knaves"]');
  expect(knaves).toHaveAttribute('aria-disabled', 'true');
});

test('picking knaves makes both vagabonds unavailable', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="knaves"]'));

  expect(container.querySelector('[data-cy="vagabond1"]')).toHaveAttribute('aria-disabled', 'true');
  expect(container.querySelector('[data-cy="vagabond2"]')).toHaveAttribute('aria-disabled', 'true');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 4 / 21+');
});

test('Homeland factions contribute their catalog reach', () => {
  const { container } = render(<App />);
  // lilypad(7) + twilight(4) + knaves(4) = 15
  fireEvent.click(container.querySelector('[data-cy="lilypad"]'));
  fireEvent.click(container.querySelector('[data-cy="twilight"]'));
  fireEvent.click(container.querySelector('[data-cy="knaves"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 15 / 21+');
});

test('sessionStorage restores picks, bans, and player selection', () => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    playerCountKey: 'player3',
    isBanMode: true,
    factionStatuses: {
      marquise: IS_PICKED,
      alliance: IS_BANNED,
    },
  }));

  const { container } = render(<App />);
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 10 / 18+');
  expect(screen.queryByRole('button', { name: /^ban$/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^3 players$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('[data-cy="alliance"]')
    .querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();

  // Legacy isBanMode is dropped on the next session write
  fireEvent.click(screen.getByRole('button', { name: /^4 players$/i }));
  const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
  expect(stored.isBanMode).toBeUndefined();
  expect(stored.factionStatuses.marquise).toBe(IS_PICKED);
});

test('reset clears persisted faction picks and bans', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  // Second tap bans
  fireEvent.click(container.querySelector('[data-cy="alliance"]'));
  fireEvent.click(container.querySelector('[data-cy="alliance"]'));

  const before = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
  expect(before.factionStatuses.marquise).toBe(IS_PICKED);
  expect(before.factionStatuses.alliance).toBe(IS_BANNED);

  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');

  const after = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
  expect(after.factionStatuses).toEqual({});
  expect(after.isBanMode).toBeUndefined();
});

test('default theme preference is system; OS dark opens dark', () => {
  mockMatchMedia(true);
  const { container } = render(<App />);
  expect(container.querySelector('[data-theme="dark"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: system/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: system/i }))
    .toHaveAttribute('data-theme-preference', 'system');
  expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
});

test('default theme preference is system; OS light opens light', () => {
  mockMatchMedia(false);
  const { container } = render(<App />);
  expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: system/i })).toBeInTheDocument();
});

test('theme toggle cycles system → light → dark → system and persists', () => {
  mockMatchMedia(false);
  const { container } = render(<App />);
  expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: system/i }))
    .toHaveAttribute('data-theme-preference', 'system');

  fireEvent.click(screen.getByRole('button', { name: /theme: system/i }));
  expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: light/i }))
    .toHaveAttribute('data-theme-preference', 'light');
  expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

  fireEvent.click(screen.getByRole('button', { name: /theme: light/i }));
  expect(container.querySelector('[data-theme="dark"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: dark/i }))
    .toHaveAttribute('data-theme-preference', 'dark');
  expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

  fireEvent.click(screen.getByRole('button', { name: /theme: dark/i }));
  expect(container.querySelector('[data-theme="light"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: system/i }))
    .toHaveAttribute('data-theme-preference', 'system');
  expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
});

test('stored theme preference survives remount within the session', () => {
  mockMatchMedia(false);
  window.sessionStorage.setItem(THEME_STORAGE_KEY, 'dark');
  const { container, unmount } = render(<App />);
  expect(container.querySelector('[data-theme="dark"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /theme: dark/i })).toBeInTheDocument();

  unmount();
  const again = render(<App />);
  expect(again.container.querySelector('[data-theme="dark"]')).toBeInTheDocument();
  expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
});

function isPickedFab(el) {
  return Boolean(
    el.querySelector('[data-testid="CheckCircleOutlineIcon"]')
    || el.querySelector('[data-testid="CheckCircleIcon"]')
    || el.querySelector('[data-cy="pick-fill"]')
    || el.querySelector('[data-cy="pick-locked"]')
  );
}

function countPicked(container) {
  return Array.from(container.querySelectorAll('[data-cy]')).filter((el) => {
    const cy = el.getAttribute('data-cy');
    if (!cy || cy === 'reach-indicator' || cy === 'reach-help' || cy === 'theme-toggle' || cy === 'random-fill' || cy === 'feedback-link') {
      return false;
    }
    if (cy === 'pick-fill' || cy === 'pick-locked') return false;
    return isPickedFab(el);
  }).length;
}

function pickedFactionNames(container) {
  return Array.from(container.querySelectorAll('[data-cy]'))
    .filter((el) => {
      const cy = el.getAttribute('data-cy');
      if (!cy || cy === 'reach-indicator' || cy === 'reach-help' || cy === 'theme-toggle' || cy === 'random-fill' || cy === 'feedback-link') {
        return false;
      }
      if (cy === 'pick-fill' || cy === 'pick-locked') return false;
      return isPickedFab(el);
    })
    .map((el) => el.getAttribute('data-cy'));
}

test('random fill: empty board fills exactly Players with reach Viable', () => {
  const { container } = render(<App />);
  const fillBtn = screen.getByRole('button', { name: /fill random factions/i });
  expect(fillBtn).not.toBeDisabled();

  fireEvent.click(fillBtn);

  expect(countPicked(container)).toBe(4);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Viable');
  const reachMatch = indicator.textContent.match(/Reach:\s*(\d+)/);
  expect(Number(reachMatch[1])).toBeGreaterThanOrEqual(21);
});

test('random fill: keeps locked picks and only fills remaining seats', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="duchy"]'));

  fireEvent.click(screen.getByRole('button', { name: /fill random factions/i }));

  const picked = pickedFactionNames(container);
  expect(picked).toHaveLength(4);
  expect(picked).toContain('marquise');
  expect(picked).toContain('duchy');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Viable');
});

test('random fill: respects bans', async () => {
  jest.useFakeTimers();
  const { container } = render(<App />);
  for (const name of ['marquise', 'hundreds']) {
    await longPressFaction(container.querySelector(`[data-cy="${name}"]`));
  }
  jest.useRealTimers();

  fireEvent.click(screen.getByRole('button', { name: /fill random factions/i }));

  const picked = pickedFactionNames(container);
  expect(picked).toHaveLength(4);
  expect(picked).not.toContain('marquise');
  expect(picked).not.toContain('hundreds');
  expect(container.querySelector('[data-cy="marquise"]')
    .querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
});

test('random fill: disabled with reason when no valid spread', async () => {
  jest.useFakeTimers();
  const { container } = render(<App />);
  // Ban enough high-reach factions that 4p / 21+ is impossible
  for (const name of [
    'marquise', 'hundreds', 'duchy', 'keepers', 'eyrie', 'lilypad',
    'riverfolk', 'vagabond1', 'twilight', 'knaves',
  ]) {
    await longPressFaction(container.querySelector(`[data-cy="${name}"]`));
  }
  jest.useRealTimers();

  const fillBtn = screen.getByRole('button', { name: /fill random factions/i });
  expect(fillBtn).toBeDisabled();
  expect(fillBtn).toHaveAttribute('title', expect.stringMatching(/no valid faction spread/i));
});

test('reset after random fill clears to empty starting board', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /fill random factions/i }));
  expect(countPicked(container)).toBe(4);
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Viable');

  fireEvent.click(screen.getByRole('button', { name: /reset/i }));

  expect(countPicked(container)).toBe(0);
  expect(container.querySelectorAll('[data-testid="NotInterestedOutlinedIcon"]')).toHaveLength(0);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 0 / 21+');
  expect(indicator).toHaveTextContent('Below target');
  // Reset must not re-fire a prior fill (no remount/id protocol).
  expect(container.querySelectorAll('[data-cy="pick-fill"]')).toHaveLength(0);
  expect(container.querySelectorAll('[data-cy="pick-locked"]')).toHaveLength(0);
});

test('reset then fill works again without leftover picks', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /fill random factions/i }));
  expect(countPicked(container)).toBe(4);

  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  expect(countPicked(container)).toBe(0);

  const fillBtn = screen.getByRole('button', { name: /fill random factions/i });
  expect(fillBtn).not.toBeDisabled();
  fireEvent.click(fillBtn);
  expect(countPicked(container)).toBe(4);
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Viable');
});

test('human picks use solid check; fill picks use outline check', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  expect(container.querySelector('[data-cy="marquise"] [data-cy="pick-locked"]')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Marquise (locked)' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /fill random factions/i }));

  expect(container.querySelector('[data-cy="marquise"] [data-cy="pick-locked"]')).toBeInTheDocument();
  expect(container.querySelectorAll('[data-cy="pick-fill"]').length).toBe(3);
  expect(container.querySelectorAll('[data-cy="pick-locked"]').length).toBe(1);
  expect(countPicked(container)).toBe(4);
});
