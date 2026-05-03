import { render, screen, within, fireEvent } from '@testing-library/react';
import App from './App';

test('reach indicator renders with initial value', () => {
  const { container } = render(<App />);
  const indicator = container.querySelector('[data-cy="reach-indicator"]');
  expect(indicator).toBeInTheDocument();
  expect(indicator).toHaveTextContent('0/21+');
});

test('pick mode: clicking a faction adds its reach to the total', () => {
  const { container } = render(<App />);
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('10/21+');
});

test('ban mode: clicking a faction bans it without adding reach', () => {
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /disable factions/i }));
  fireEvent.click(container.querySelector('[data-cy="marquise"]'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('0/21+');
});

test('selecting 1 clockwork 1 player sets required reach to 8', () => {
  const { container } = render(<App />);
  // div.container order: [0] Players, [1] 1 Clockwork, [2] 2 Clockworks
  const oneClockworkSection = container.querySelectorAll('div.container')[1];
  fireEvent.click(within(oneClockworkSection).getByText('1'));
  expect(container.querySelector('[data-cy="reach-indicator"]')).toHaveTextContent('0/8+');
});
