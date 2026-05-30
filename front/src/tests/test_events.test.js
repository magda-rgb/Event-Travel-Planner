import { screen, waitFor } from '@testing-library/react';
import EventsPage from '../EventsPage';
import { SEARCH_URL } from '../constants';
import { renderWithProviders } from './testUtils';

describe('EventsPage', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('bez parametrów w URL pokazuje komunikat o podaniu miasta', async () => {
        renderWithProviders(<EventsPage />, { route: '/search' });

        expect(
            await screen.findByText('Podaj miasto lub datę, żeby wyszukać wydarzenia.')
        ).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('z parametrem city wyświetla listę wydarzeń z API', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                events: [
                    {
                        id: 'evt-1',
                        name: 'Koncert Testowy',
                        venue: 'Stadion Narodowy',
                        city: 'Warszawa',
                        date: '2026-06-01',
                        segment: 'Music',
                    },
                ],
            }),
        });

        renderWithProviders(<EventsPage />, { route: '/search?city=Warszawa' });

        expect(await screen.findByText('Koncert Testowy')).toBeInTheDocument();
        expect(screen.getByText('Stadion Narodowy • 2026-06-01')).toBeInTheDocument();
        expect(screen.getByText('1 wynik(ów) z Ticketmaster.')).toBeInTheDocument();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(`${SEARCH_URL}?city=Warszawa`);
        });
    });
});
