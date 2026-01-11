import { useEffect, useState } from 'react';
import { SEARCH_URL, fallbackImages } from './constants';

function EventsPage() {
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');

    useEffect(() => {
        let isMounted = true;
        setIsLoadingEvents(true);
        fetch(SEARCH_URL)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Request failed with ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!isMounted) return;
                if (!data || typeof data !== 'object') {
                    throw new Error('Unexpected response shape');
                }
                const mapped = Object.entries(data).map(([title, blurb], idx) => ({
                    title: title || `Result ${idx + 1}`,
                    blurb:
                        typeof blurb === 'string' && blurb.trim()
                            ? blurb
                            : 'Details coming soon.',
                    image: fallbackImages[idx % fallbackImages.length],
                }));
                setEvents(mapped);
                setEventsError('');
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error(err);
                setEventsError('Could not load search results right now.');
                setEvents([]);
            })
            .finally(() => {
                if (isMounted) setIsLoadingEvents(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="page">
            <section className="events-page">
                <header className="section-header">
                    <p className="eyebrow">All events</p>
                    <h2>Search results</h2>
                    <p className="muted">Listing everything from /search.</p>
                </header>
                {isLoadingEvents ? (
                    <p className="muted">Loading events…</p>
                ) : eventsError ? (
                    <p className="muted">{eventsError}</p>
                ) : events.length ? (
                    <div className="events-grid">
                        {events.map((event) => (
                            <article key={event.title} className="choice-card">
                                <div
                                    className="choice-image"
                                    style={{ backgroundImage: `url(${event.image})` }}
                                    role="img"
                                    aria-label={event.title}
                                />
                                <div className="choice-body">
                                    <h3>{event.title}</h3>
                                    <p>{event.blurb}</p>
                                    <button type="button" className="ghost-btn">
                                        View details
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="muted">No events available right now.</p>
                )}
            </section>
        </div>
    );
}

export default EventsPage;