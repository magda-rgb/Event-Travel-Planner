import { act, renderHook } from '@testing-library/react';
import useThemeToggle from '../hooks/useThemeToggle';

describe('useThemeToggle', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
    });

    test('wczytuje motyw z localStorage', () => {
        localStorage.setItem('theme', 'dark');

        const { result } = renderHook(() => useThemeToggle());

        expect(result.current.themeOn).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('przełączenie motywu aktualizuje localStorage i klasę na html', () => {
        const { result } = renderHook(() => useThemeToggle());

        expect(result.current.themeOn).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.themeOn).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.themeOn).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
});
