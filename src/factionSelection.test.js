import { IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED } from './constants';
import { nextStatusOnLongPress, nextStatusOnTap } from './factionSelection';

describe('nextStatusOnTap', () => {
  test('cycles available → picked → banned → available', () => {
    expect(nextStatusOnTap(IS_AVAILABLE)).toBe(IS_PICKED);
    expect(nextStatusOnTap(IS_PICKED)).toBe(IS_BANNED);
    expect(nextStatusOnTap(IS_BANNED)).toBe(IS_AVAILABLE);
  });

  test('does not pick not-available (illegal)', () => {
    expect(nextStatusOnTap(IS_NOT_AVAILABLE)).toBeNull();
  });

  test('unknown status is a no-op', () => {
    expect(nextStatusOnTap('SOMETHING_ELSE')).toBeNull();
  });
});

describe('nextStatusOnLongPress', () => {
  test('bans available, picked, and not-available', () => {
    expect(nextStatusOnLongPress(IS_AVAILABLE)).toBe(IS_BANNED);
    expect(nextStatusOnLongPress(IS_PICKED)).toBe(IS_BANNED);
    expect(nextStatusOnLongPress(IS_NOT_AVAILABLE)).toBe(IS_BANNED);
  });

  test('clears banned back to available', () => {
    expect(nextStatusOnLongPress(IS_BANNED)).toBe(IS_AVAILABLE);
  });
});
