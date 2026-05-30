import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import RegisterUser from '../RegisterUser';
import { REGISTER_URL } from '../constants';
import { renderWithProviders } from './testUtils';

function RegisterRoutes() {
    return (
        <Routes>
            <Route path="/register" element={<RegisterUser />} />
            <Route path="/" element={<div>Strona główna</div>} />
        </Routes>
    );
}

describe('RegisterUser', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('renderuje pola formularza rejestracji', () => {
        renderWithProviders(<RegisterRoutes />, { route: '/register' });

        expect(screen.getByRole('heading', { name: 'Rejestracja' })).toBeInTheDocument();
        expect(screen.getByLabelText('Nazwa użytkownika')).toBeInTheDocument();
        expect(screen.getByLabelText('Imię i nazwisko')).toBeInTheDocument();
        expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
        expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Zarejestruj się' })).toBeInTheDocument();
    });

    test('po udanej rejestracji przekierowuje na stronę główną', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1 }),
        });

        renderWithProviders(<RegisterRoutes />, { route: '/register' });

        await userEvent.type(screen.getByLabelText('Nazwa użytkownika'), 'jan');
        await userEvent.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski');
        await userEvent.type(screen.getByLabelText('Hasło'), 'haslo123');
        await userEvent.type(screen.getByLabelText('E-mail'), 'jan@example.com');
        await userEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                REGISTER_URL,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        username: 'jan',
                        password: 'haslo123',
                        fullname: 'Jan Kowalski',
                        email: 'jan@example.com',
                    }),
                })
            );
            expect(screen.getByText('Strona główna')).toBeInTheDocument();
        });
    });

    test('pokazuje komunikat błędu z API po nieudanej rejestracji', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            statusText: 'Bad Request',
            json: async () => ({ detail: 'Użytkownik już istnieje' }),
        });

        renderWithProviders(<RegisterRoutes />, { route: '/register' });

        await userEvent.type(screen.getByLabelText('Nazwa użytkownika'), 'jan');
        await userEvent.type(screen.getByLabelText('Imię i nazwisko'), 'Jan Kowalski');
        await userEvent.type(screen.getByLabelText('Hasło'), 'haslo123');
        await userEvent.type(screen.getByLabelText('E-mail'), 'jan@example.com');
        await userEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Użytkownik już istnieje');
        expect(screen.queryByText('Strona główna')).not.toBeInTheDocument();
    });
});
