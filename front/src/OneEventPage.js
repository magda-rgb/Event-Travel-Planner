import { useEffect, useState } from 'react';
import { eventDetailUrl, fallbackImages, segmentImageIndex } from './constants';
import { useParams } from "react-router-dom";
import PageHeader from './components/PageHeader';


function formatPrice(event) {
    if (event.price_min == null && event.price_max == null) return null;
    const cur = event.price_currency || '';
    if (event.price_min != null && event.price_max != null && event.price_min !== event.price_max) {
        return `${event.price_min} – ${event.price_max} ${cur}`.trim();
    }
    const v = event.price_min ?? event.price_max;
    return `${v} ${cur}`.trim();
}


function OneEventPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!id) return;
        let isMounted = true;
        setIsLoading(true);

        fetch(eventDetailUrl(id))
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.detail || `Request failed with ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!isMounted) return;
                setEvent(data);
                setErrorMsg('');
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error(err);
                setErrorMsg(err.message || 'Nie można załadować szczegółów wydarzenia.');
                setEvent(null);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="page">
                <PageHeader />
                <section className="events-page">
                    <p className="muted">Ładowanie wydarzenia…</p>
                </section>
            </div>
        );
    }

    if (errorMsg || !event) {
        return (
            <div className="page">
                <PageHeader />
                <section className="events-page">
                    <header className="section-header">
                        <h2>Nie znaleziono wydarzenia</h2>
                    </header>
                    <p className="muted">{errorMsg || 'Wydarzenie jest niedostępne.'}</p>
                </section>
            </div>
        );
    }

    const img = event.image || fallbackImages[
        segmentImageIndex[event.segment] ?? 0
    ];
    const venueLine = [event.venue, event.address, event.city, event.country]
        .filter(Boolean)
        .join(', ');
    const dateTime = [event.date, event.time].filter(Boolean).join(' ');
    const price = formatPrice(event);
    const classification = [event.segment, event.genre].filter(Boolean).join(' / ');

    return (
        <div className="page">
            <PageHeader />
            <section className="events-page">
                <header className="section-header">
                    <p className="eyebrow">Wybrany event</p>
                    <h2>{event.name}</h2>
                    <p className="muted">{classification || '\u00a0'}</p>
                </header>

                <article className="choice-grid">
                    <div
                        className="choice-image"
                        style={{ backgroundImage: `url(${img})` }}
                        role="img"
                        aria-label={event.name}
                    />
                    <div className="choice-body">
                        <p className="eyebrow">Kiedy</p>
                        <h3>{dateTime || 'Termin do potwierdzenia'}</h3>

                        <p className="eyebrow">Gdzie</p>
                        <h3>{venueLine || '—'}</h3>

                        {price ? (
                            <>
                                <p className="eyebrow">Cena</p>
                                <h3>{price}</h3>
                            </>
                        ) : null}

                        {event.info ? (
                            <>
                                <p className="eyebrow">Opis</p>
                                <p>{event.info}</p>
                            </>
                        ) : null}

                        {event.please_note ? (
                            <>
                                <p className="eyebrow">Uwagi</p>
                                <p>{event.please_note}</p>
                            </>
                        ) : null}

                        {event.url ? (
                            <a
                                className="ghost-btn"
                                href={event.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{ marginTop: '1rem', display: 'inline-block' }}
                            >
                                Kup bilet na Ticketmaster
                            </a>
                        ) : null}
                    </div>
                </article>
            </section>
        </div>
    );
}

export default OneEventPage;
