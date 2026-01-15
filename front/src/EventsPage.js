import { useEffect, useState } from 'react';
import {SEARCH_URL, fallbackImages, eventImageIndex} from './constants';
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "./AuthContext";


function EventsPage() {
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');
    const navigate = useNavigate();
    const image = fallbackImages[eventImageIndex[events.rodzaj] ?? 0];


    const {search} =useLocation();
    const searchTerm = new URLSearchParams(search).get("q");
    const [themeOn, setThemeOn] = useState(
        document.documentElement.classList.contains("dark")
    );
    const {user,logout} = useAuth();

    function toggleTheme() {
        setThemeOn((prev) => {
            const next = !prev;
            document.documentElement.classList.toggle("dark", next);
            localStorage.theme = next ? "dark" : "light";
            return next;
        });
    }

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
                const mapped = Object.entries(data).map(([key, ev], idx) => ({
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
    
    const handleOneEvent = (id) => {
        navigate(`/event?q=${encodeURIComponent(id)}`);
    };

    return (
        <div className="page">
            <section className="heading">
                <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => navigate(-1)}>
                    Back
                </button>
                <section className="buttons-sth">
                    <button type="button" className="ghost-btn">
                        ENG/PL
                    </button>

                    <button
                        type="button"
                        className={`toggle ${themeOn ? "is-on" : ""}`}
                        onClick={toggleTheme}
                        aria-label="Motyw"
                    >
                        <span className="toggle-knob" />
                    </button>

                </section>
            </section>
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