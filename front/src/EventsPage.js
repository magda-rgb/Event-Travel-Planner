import { useEffect, useState } from 'react';
import { SEARCH_URL, fallbackImages, segmentImageIndex } from './constants';
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from './components/PageHeader';


function EventsPage() {
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');
    const navigate = useNavigate();

    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const city = params.get("city") || "";
    const date = params.get("date") || "";
    const keyword = params.get("keyword") || "";

    useEffect(() => {
        if (!city && !date && !keyword) {
            setEvents([]);
            setIsLoadingEvents(false);
            setEventsError('Podaj miasto lub datę, żeby wyszukać wydarzenia.');
            return;
        }

        let isMounted = true;
        setIsLoadingEvents(true);

        const qs = new URLSearchParams();
        if (city) qs.set('city', city);
        if (date) qs.set('date', date);
        if (keyword) qs.set('keyword', keyword);

        fetch(`${SEARCH_URL}?${qs.toString()}`)
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.detail || `Request failed with ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!isMounted) return;
                const list = Array.isArray(data?.events) ? data.events : [];
                setEvents(list);
                setEventsError('');
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error(err);
                setEventsError(err.message || 'Nie można teraz załadować wyników wyszukiwania.');
                setEvents([]);
            })
            .finally(() => {
                if (isMounted) setIsLoadingEvents(false);
            });
        return () => {
            isMounted = false;
        };
    }, [city, date, keyword]);

    const handleOneEvent = (id) => {
        navigate(`/event/${encodeURIComponent(id)}`);
    };

    const dateLabel = date ? `od ${date}` : '';
    const heading = [city, dateLabel].filter(Boolean).join(' • ') || 'Wyniki wyszukiwania';

    return (
        <div className="page">
            <PageHeader />
            <section className="events-page">
                <header className="section-header">
                    <p className="eyebrow">Wydarzenia</p>
                    <h2>{heading}</h2>
                    <p className="muted">{events.length} wynik(ów) z Ticketmaster.</p>
                </header>
                {isLoadingEvents ? (
                    <p className="muted">Ładowanie wydarzeń…</p>
                ) : eventsError ? (
                    <p className="muted">{eventsError}</p>
                ) : events.length ? (
                    <div className="events-grid">
                        {events.map((event) => {
                            const img = event.image || fallbackImages[
                                segmentImageIndex[event.segment] ?? 0
                            ];
                            const subtitle = [event.venue || event.city, event.date]
                                .filter(Boolean)
                                .join(' • ');
                            return (
                                <article key={event.id} className="choice-card">
                                    <div
                                        className="choice-image"
                                        style={{ backgroundImage: `url(${img})` }}
                                        role="img"
                                        aria-label={event.name}
                                    />
                                    <div className="choice-body">
                                        <h3>{event.name}</h3>
                                        <p>{subtitle}</p>
                                        <button
                                            type="button"
                                            className="ghost-btn"
                                            onClick={() => handleOneEvent(event.id)}
                                        >
                                            Zobacz szczegóły
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <p className="muted">Brak wydarzeń pasujących do zapytania.</p>
                )}
            </section>
        </div>
    );
}

export default EventsPage;
