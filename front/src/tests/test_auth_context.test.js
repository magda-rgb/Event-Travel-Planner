import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

function AuthProbe() {
    const { user, login, logout } = useAuth();

    return (
        <div>
            <span data-testid="username">{user ? user.username : 'brak'}</span>
            <button type="button" onClick={() => login('jan', 'token-abc')}>
                Zaloguj
            </button>
            <button type="button" onClick={logout}>
                Wyloguj
            </button>
        </div>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('login zapisuje token i nazwę użytkownika w localStorage', async () => {
        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>
        );

        expect(screen.getByTestId('username')).toHaveTextContent('brak');

        await userEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));

        expect(localStorage.getItem('access_token')).toBe('token-abc');
        expect(localStorage.getItem('username')).toBe('jan');
        expect(screen.getByTestId('username')).toHaveTextContent('jan');
    });

    test('logout czyści localStorage', async () => {
        localStorage.setItem('access_token', 'token-abc');
        localStorage.setItem('username', 'jan');

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>
        );

        expect(screen.getByTestId('username')).toHaveTextContent('jan');

        await userEvent.click(screen.getByRole('button', { name: 'Wyloguj' }));

        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('username')).toBeNull();
        expect(screen.getByTestId('username')).toHaveTextContent('brak');
    });

    test('wczytuje użytkownika z localStorage przy starcie', () => {
        localStorage.setItem('access_token', 'saved-token');
        localStorage.setItem('username', 'zapisany');

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>
        );

        expect(screen.getByTestId('username')).toHaveTextContent('zapisany');
    });
});
