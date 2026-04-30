import { useEffect, useState } from 'react';
import {ONE_EVENT_URL, eventImageIndex, fallbackImages} from './constants';
import {useLocation} from "react-router-dom";
import PageHeader from './components/PageHeader';

function OneEventPage() {
    const [event, setEvent] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');
    const {search} =useLocation();
    const eventId = new URLSearchParams(search).get("q");



    

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
            <PageHeader />
            <div>
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
        </div>
    );
}

export default OneEventPage;