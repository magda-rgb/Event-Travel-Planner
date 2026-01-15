import { useEffect, useState } from 'react';
import {SEARCH_URL,eventImageIndex, fallbackImages, ONE_EVENT_URL} from './constants';
import {useLocation} from "react-router-dom";
import {useAuth} from "./AuthContext";
import {useNavigate} from "react-router-dom";

function OneEventPage() {
    const [event, setEvent] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');
    const {search} =useLocation();
    const eventId = new URLSearchParams(search).get("q");
    const navigate = useNavigate();

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
        fetch(`${ONE_EVENT_URL}?q=${encodeURIComponent(eventId)}`)
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
                const one = {
                    title: data.miejsce,
                    date: data.data,
                    type: data.rodzaj,
                    blurb: `${data.rodzaj}-${data.data}`,
                    image: fallbackImages[ 
                        eventImageIndex[(data.rodzaj || "").trim().toLowerCase()] ?? 0],
                    raw:data,
                    organizer: data.organizator,
                };
                setEvent(one);
                setEventsError('');
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error(err);
                setEventsError('Could not load search results right now.');
                setEvent([]);
            })
            .finally(() => {
                if (isMounted) setIsLoadingEvents(false);
            });
        return () => {
            isMounted = false;
        };
    }, [eventId]);

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
                    <p className="eyebrow">Wybrany event</p>
                    <h2>{event.title}</h2>
                    <p className="muted">{event.type}</p>
                </header>
                {isLoadingEvents ? (
                    <p className="muted">Loading events…</p>
                ) : eventsError ? (
                    <p className="muted">{eventsError}</p>
                ) : event ? (
                    <article className="choice-grid">
                      <div
                      className="choice-image"
                      style={{backgroundImage: `url(${event.image})`}}
                      role="img"
                      aria-label={event.title}/>
                        <div className="choice-body">
                            <p className="eyebrow">Data wydarzenia</p>
                            <h2>{event.date}</h2>
                            <p className="eyebrow">Organizator</p>
                            <h2>{event.organizer}</h2>
                            <p className="eyebrow">Opis eventu</p>
                            <p>----</p>
                        </div>
                    </article>
                ) : (
                    <p className="muted">No events available right now.</p>
                )}
            </section>
        </div>
    );
}

export default OneEventPage;