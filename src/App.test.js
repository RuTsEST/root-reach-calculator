import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY } from './sessionStorage';
import { THEME_STORAGE_KEY } from './theme';
import { FEEDBACK_URL, REACH_LAW_URL, IS_BANNED, IS_PICKED } from './constants';

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

test('defaults to Pick mode with Pick left of Ban', () => {
  render(<App />);
  const pick = screen.getByRole('button', { name: /^pick$/i });
  const ban = screen.getByRole('button', { name: /^ban$/i });
  expect(pick).toHaveAttribute('aria-pressed', 'true');
  expect(ban).toHaveAttribute('aria-pressed', 'false');
  // Document order: Pick before Ban
  expect(
    pick.compareDocumentPosition(ban) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
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
  expect(indicator).toHaveTextContent('OK');
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
  expect(dialog).toHaveTextContent('What is Reach?');
  expect(dialog).toHaveTextContent('Why it matters');
  expect(dialog).toHaveTextContent('Using this calculator');

  const lawLink = screen.getByRole('link', { name: /law of root — viable reach sums/i });
  expect(lawLink).toHaveAttribute('href', REACH_LAW_URL);
  expect(lawLink).toHaveAttribute('target', '_blank');
  expect(lawLink).toHaveAttribute('rel', expect.stringMatching(/noopener/));
  expect(lawLink).toHaveAttribute('rel', expect.stringMatching(/noreferrer/));

  fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('pick mode: clicking a faction adds its reach to the total', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 10 / 21+');
  expect(indicator).toHaveTextContent('Below target');
});

test('ban mode: clicking a faction bans it without adding reach', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^ban$/i }));
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 0 / 21+');
  expect(indicator).toHaveTextContent('Below target');
});

test('ban mode: can ban a faction grayed out as unavailable', () => {
  const { container } = render(<App />);
  // Fill all 4 player slots so remaining factions are IS_NOT_AVAILABLE
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="duchy"]'));
  fireEvent.click(container.querySelector('[data-cy="hundreds"]'));
  fireEvent.click(container.querySelector('[data-cy="eyrie"]'));

  const alliance = container.querySelector('[data-cy="alliance"]');
  expect(alliance).toBeDisabled();
  expect(alliance).toHaveStyle({
    width: 'var(--faction-fab-size-disabled)',
    opacity: '50%',
  });
  // Slot still reserves full fab geometry so disabled shrink does not collapse rows.
  expect(alliance.closest('.faction-fab-slot')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: /^ban$/i }));
  expect(alliance).not.toBeDisabled();
  // Ban mode restores full size/opacity so unavailable fabs look clickable
  expect(alliance).toHaveStyle({
    width: 'var(--faction-fab-size)',
    opacity: '100%',
  });

  fireEvent.click(alliance);
  expect(alliance).not.toBeDisabled();
  expect(alliance.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 34 / 21+');
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
    isBanMode: false,
    factionStatuses: {},
  }));
  const { container } = render(<App />);
  expect(screen.getByRole('button', { name: /^4 players$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');
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
  expect(vagabond2).toBeDisabled();

  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="vagabond1"]'));
  expect(container.querySelector('[data-cy="vagabond1"]')).not.toBeDisabled();
  expect(container.querySelector('[data-cy="vagabond2"]')).not.toBeDisabled();

  fireEvent.click(container.querySelector('[data-cy="vagabond2"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 17 / 21+');
});

test('picking a vagabond makes knaves unavailable', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="vagabond1"]'));

  const knaves = container.querySelector('[data-cy="knaves"]');
  expect(knaves).toBeDisabled();
});

test('picking knaves makes both vagabonds unavailable', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="knaves"]'));

  expect(container.querySelector('[data-cy="vagabond1"]')).toBeDisabled();
  expect(container.querySelector('[data-cy="vagabond2"]')).toBeDisabled();
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

test('sessionStorage restores picks, bans, mode, and player selection', () => {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    selectedValue: 'player3',
    isBanMode: true,
    factionStatuses: {
      marquise: IS_PICKED,
      alliance: IS_BANNED,
    },
  }));

  const { container } = render(<App />);
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 10 / 18+');
  expect(screen.getByRole('button', { name: /^ban$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /^3 players$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('[data-cy="alliance"]')
    .querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
});

test('reset clears persisted faction picks and bans', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(screen.getByRole('button', { name: /^ban$/i }));
  fireEvent.click(container.querySelector('[data-cy="alliance"]'));

  const before = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
  expect(before.factionStatuses.marquise).toBe(IS_PICKED);
  expect(before.factionStatuses.alliance).toBe(IS_BANNED);

  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');

  const after = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
  expect(after.factionStatuses).toEqual({});
  expect(after.isBanMode).toBe(true);
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

test('random fill: empty board fills exactly Players with reach OK', () => {
  const { container } = render(<App />);
  const fillBtn = screen.getByRole('button', { name: /fill random factions/i });
  expect(fillBtn).not.toBeDisabled();

  fireEvent.click(fillBtn);

  expect(countPicked(container)).toBe(4);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('OK');
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
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('OK');
});

test('random fill: respects bans', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^ban$/i }));
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  fireEvent.click(container.querySelector('[data-cy="hundreds"]'));
  fireEvent.click(screen.getByRole('button', { name: /^pick$/i }));

  fireEvent.click(screen.getByRole('button', { name: /fill random factions/i }));

  const picked = pickedFactionNames(container);
  expect(picked).toHaveLength(4);
  expect(picked).not.toContain('marquise');
  expect(picked).not.toContain('hundreds');
  expect(container.querySelector('[data-cy="marquise"]')
    .querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
});

test('random fill: disabled with reason when no valid spread', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^ban$/i }));
  // Ban enough high-reach factions that 4p / 21+ is impossible
  [
    'marquise', 'hundreds', 'duchy', 'keepers', 'eyrie', 'lilypad',
    'riverfolk', 'vagabond1', 'twilight', 'knaves',
  ].forEach((name) => {
    fireEvent.click(container.querySelector(`[data-cy="${name}"]`));
  });

  const fillBtn = screen.getByRole('button', { name: /fill random factions/i });
  expect(fillBtn).toBeDisabled();
  expect(fillBtn).toHaveAttribute('title', expect.stringMatching(/no valid faction spread/i));
});

test('reset after random fill clears to empty starting board', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /fill random factions/i }));
  expect(countPicked(container)).toBe(4);
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('OK');

  fireEvent.click(screen.getByRole('button', { name: /reset/i }));

  expect(countPicked(container)).toBe(0);
  expect(container.querySelectorAll('[data-testid="NotInterestedOutlinedIcon"]')).toHaveLength(0);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 0 / 21+');
  expect(indicator).toHaveTextContent('Below target');
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
