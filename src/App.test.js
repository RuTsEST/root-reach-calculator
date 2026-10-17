import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { STORAGE_KEY } from './sessionStorage';
import { IS_BANNED, IS_PICKED } from './constants';

beforeEach(() => {
  window.sessionStorage.clear();
});

test('reach indicator renders with initial value', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toBeInTheDocument();
  expect(indicator).toHaveTextContent('Reach: 0 / 21+');
  expect(indicator).toHaveTextContent('Below target');
});

test('reach indicator is red when reach is below required', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveStyle({ color: '#b66969' });
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
  expect(indicator).toHaveStyle({ color: '#4da251' });
  expect(indicator).toHaveTextContent('OK');
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
  expect(alliance).toHaveStyle({ width: '4em', opacity: '50%' });

  fireEvent.click(screen.getByRole('button', { name: /^ban$/i }));
  expect(alliance).not.toBeDisabled();
  // Ban mode restores full size/opacity so unavailable fabs look clickable
  expect(alliance).toHaveStyle({ width: '7em', opacity: '100%' });

  fireEvent.click(alliance);
  expect(alliance).not.toBeDisabled();
  expect(alliance.querySelector('[data-testid="NotInterestedOutlinedIcon"]')).toBeInTheDocument();
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 34 / 21+');
});

test('switching to 1 bot with 1 player sets required reach to 8', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^1 bot$/i }));
  // Default players was 4; keep 4 if still legal under 1 bot (threshold 16).
  // Select 1 player for the classic 1-bot solo threshold of 8.
  fireEvent.click(screen.getByRole('button', { name: /^1 player$/i }));
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 0 / 8+');
  expect(indicator).toHaveTextContent('Below target');
});

test('1 bot keeps legal player count and updates reach threshold', () => {
  const { container } = render(<App />);
  // Start at 4 players (21+); switch to 1 bot → keep 4 → 1clockwork4 (16+)
  fireEvent.click(screen.getByRole('button', { name: /^1 bot$/i }));
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveTextContent('Reach: 0 / 16+');
  expect(screen.getByRole('button', { name: /^5 players$/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /^6 players$/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /^1 player$/i })).not.toBeDisabled();
});

test('2 bots selects matching clockwork threshold', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^2 bots$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^2 players$/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 14+');
});

test('defaults to 0 bots with 4 players selected', () => {
  const { container } = render(<App />);
  expect(screen.getByRole('button', { name: /^0 bots$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /^4 players$/i })).toHaveAttribute('aria-pressed', 'true');
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');
});

test('illegal player counts are disabled for current bot count', () => {
  render(<App />);
  // No bots: player 1 illegal; 2–6 legal
  expect(screen.getByRole('button', { name: /^1 player$/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /^2 players$/i })).not.toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: /^1 bot$/i }));
  expect(screen.getByRole('button', { name: /^1 player$/i })).not.toBeDisabled();
  expect(screen.getByRole('button', { name: /^5 players$/i })).toBeDisabled();
});

test('switching bots remaps illegal player count to a valid default', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^5 players$/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 25+');

  // 5 players is illegal with bots → clamp to 4 → 1clockwork4 (16+)
  fireEvent.click(screen.getByRole('button', { name: /^1 bot$/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 16+');
  expect(screen.getByRole('button', { name: /^4 players$/i })).toHaveAttribute('aria-pressed', 'true');

  // 1 player is illegal with 0 bots → clamp to 2 → player2 (17+)
  fireEvent.click(screen.getByRole('button', { name: /^1 player$/i }));
  fireEvent.click(screen.getByRole('button', { name: /^0 bots$/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 17+');
  expect(screen.getByRole('button', { name: /^2 players$/i })).toHaveAttribute('aria-pressed', 'true');
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

test('reach indicator has aria-live for status changes', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveAttribute('aria-live', 'polite');
});

test('footer shows unofficial disclaimer and copyright', () => {
  const { container } = render(<App />);
  const disclaimer = container.querySelector('[data-cy="disclaimer"]');
  expect(disclaimer).toBeInTheDocument();
  expect(disclaimer).toHaveTextContent(/Unofficial fan tool/);
  expect(disclaimer).toHaveTextContent(/not affiliated with Leder Games or Root/);
  expect(disclaimer).toHaveTextContent(/© 2026 RuTsEST/);
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

test('sessionStorage restores picks, bans, mode, and player-bot selection', () => {
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
