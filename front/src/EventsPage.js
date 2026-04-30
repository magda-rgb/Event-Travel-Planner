import { useEffect, useState } from 'react';
import {SEARCH_URL, fallbackImages, eventImageIndex} from './constants';
import {useLocation, useNavigate} from "react-router-dom";
import PageHeader from './components/PageHeader';


function EventsPage() {
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');
    const navigate = useNavigate();


    const {search} =useLocation();
    const searchTerm = new URLSearchParams(search).get("q");
    

    useEffect(() => {
        let isMounted = true;
        setIsLoadingEvents(true);
        fetch(`${SEARCH_URL}?q=${encodeURIComponent(searchTerm)}`)
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
                const mapped = Object.entries(data).map(([key, ev]) => ({
                    id: key,
                    title: ev.miejsce,
                    blurb: `${ev.rodzaj}-${ev.data}`,
                    rodzaj: ev.rodzaj
                }));
                setEvents(mapped);
                setEventsError('');
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error(err);
                setEventsError('Nie można teraz załadować wyników wyszukiwania.');
                setEvents([]);
            })
            .finally(() => {
                if (isMounted) setIsLoadingEvents(false);
            });
        return () => {
            isMounted = false;
        };
    }, [searchTerm]);
    
    const handleOneEvent = (id) => {
        navigate(`/event?q=${encodeURIComponent(id)}`);
    };

    return (
        <div className="page">
            <PageHeader />
            <section className="events-page">
                <header className="section-header">
                    <p className="eyebrow">Wszystkie wydarzenia</p>
                    <h2>Wyniki wyszukiwania</h2>
                    <p className="muted">Wyświetlanie wszystkiego z /search.</p>
                </header>
                {isLoadingEvents ? (
                    <p className="muted">Ładowanie wydarzeń…</p>
                ) : eventsError ? (
                    <p className="muted">{eventsError}</p>
                ) : events.length ? (
                    <div className="events-grid">
                        {events.map((event) => (
                            <article key={event.id} className="choice-card">
                                <div
                                    className="choice-image"
                                    style={{ backgroundImage: `url(${
                                            fallbackImages[
                                            eventImageIndex[(event.rodzaj || "").trim().toLowerCase()] ?? 0
                                                ]
                                    })` }}                                    
                                    role="img"
                                    aria-label={event.title}
                                />
                                <div className="choice-body">
                                    <h3>{event.title}</h3>
                                    <p>{event.blurb}</p>
                                    <button 
                                        type="button" 
                                        className="ghost-btn" 
                                        onClick={() => handleOneEvent(event.id)}>
                                        Zobacz szczegóły
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