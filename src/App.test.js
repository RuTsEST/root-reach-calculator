import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('reach indicator renders with initial value', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toBeInTheDocument();
  expect(indicator).toHaveTextContent('Reach: 0 / 21+');
});

test('reach indicator is red when reach is below required', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toHaveStyle({ color: '#b66969' });
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
});

test('pick mode: clicking a faction adds its reach to the total', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 10 / 21+');
});

test('ban mode: clicking a faction bans it without adding reach', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^ban$/i }));
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');
});

test('switching to 1 Bot mode sets required reach to 8', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /1 bot/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 8+');
});

test('reset button clears picked factions and returns reach to 0', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 10 / 21+');
  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('Reach: 0 / 21+');
});
