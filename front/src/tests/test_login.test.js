import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { LOGIN_URL } from '../constants';
import { renderWithProviders } from './testUtils';

function LoginRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Strona główna</div>} />
        </Routes>
    );
}

describe('LoginPage', () => {
    beforeEach(() => {
        localStorage.clear();
        global.fetch = jest.fn();
    });

    test('renderuje pola formularza logowania', () => {
        renderWithProviders(<LoginRoutes />, { route: '/login' });

        expect(screen.getByRole('heading', { name: 'Logowanie' })).toBeInTheDocument();
        expect(screen.getByLabelText('Nazwa użytkownika')).toBeInTheDocument();
        expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Zaloguj' })).toBeInTheDocument();
    });

    test('pokazuje komunikat błędu z API po nieudanym logowaniu', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Nieprawidłowe dane logowania' }),
        });

        renderWithProviders(<LoginRoutes />, { route: '/login' });

        await userEvent.type(screen.getByLabelText('Nazwa użytkownika'), 'jan');
        await userEvent.type(screen.getByLabelText('Hasło'), 'zle-haslo');
        await userEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Błąd logowania')).toBeInTheDocument();
        expect(screen.getByText('Nieprawidłowe dane logowania')).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith(
            LOGIN_URL,
            expect.objectContaining({ method: 'POST' })
        );
    });

    test('po udanym logowaniu zapisuje dane w localStorage i przechodzi na stronę główną', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: 'nowy-token' }),
        });

        renderWithProviders(<LoginRoutes />, { route: '/login' });

        await userEvent.type(screen.getByLabelText('Nazwa użytkownika'), 'jan');
        await userEvent.type(screen.getByLabelText('Hasło'), 'haslo123');
        await userEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));

        await waitFor(() => {
            expect(localStorage.getItem('access_token')).toBe('nowy-token');
            expect(localStorage.getItem('username')).toBe('jan');
            expect(screen.getByText('Strona główna')).toBeInTheDocument();
        });
    });
});
