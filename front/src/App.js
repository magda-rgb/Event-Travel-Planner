import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import EventsPage from './EventsPage';
import { EVENTS_URL, fallbackImages } from './constants';

const heroSlides = [
    {
        title: 'Discover art in the theater',
        description: 'Sunrise beaches, salty breeze, and fresh coffee.',
        image:
            'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        title: 'Discover music events',
        description: 'Cool forest paths and weekend hikes with friends.',
        image:
            'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        title: 'Discover cultural events',
        description: 'Skyline views, rooftop dinners, and live music.',
        image:
            'https://images.unsplash.com/photo-1533144169699-97ec15a75e92?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
];

function HomePage({ events, isLoadingEvents, eventsError }) {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const lastIndex = heroSlides.length - 1;
    const [themeOn, setThemeOn] = useState(
        document.documentElement.classList.contains("dark")
    );

    function toggleTheme() {
        setThemeOn((prev) => {
            const next = !prev;
            document.documentElement.classList.toggle("dark", next);
            localStorage.theme = next ? "dark" : "light";
            return next;
        });
    }



    useEffect(() => {
        const id = setInterval(() => {
            setActiveIndex((prev) => (prev === lastIndex ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(id);
    }, [lastIndex]);

    const handleSearch = (event) => {
        event.preventDefault();
        navigate('/search');
    };

    const featuredChoices = events.slice(0, 3);

    return (
        <div className="page">
            <section className="heading">
                <button type="button" className="ghost-btn" >
                    logowanie
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
            <section className="hero">
                <div className="carousel">
                    {heroSlides.map((slide, idx) => (
                        <article
                            key={slide.title}
                            className={`slide ${idx === activeIndex ? 'is-active' : ''}`}
                            style={{ backgroundImage: `url(${slide.image})` }}
                            aria-hidden={idx !== activeIndex}
                        >
                            <div className="overlay" />
                            <div className="slide-content">
                                <p className="eyebrow">Featured</p>
                                <h1>{slide.title}</h1>
                                <p className="description">{slide.description}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="controls">
                    <button
                        type="button"
                        onClick={() =>
                            setActiveIndex((prev) => (prev === 0 ? lastIndex : prev - 1))
                        }
                        aria-label="Previous slide"
                    >
                        ‹
                    </button>
                    <div className="dots" role="tablist" aria-label="Carousel dots">
                        {heroSlides.map((slide, idx) => (
                            <button
                                key={slide.title}
                                type="button"
                                className={idx === activeIndex ? 'dot is-active' : 'dot'}
                                aria-label={`Go to slide ${idx + 1}`}
                                onClick={() => setActiveIndex(idx)}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() =>
                            setActiveIndex((prev) => (prev === lastIndex ? 0 : prev + 1))
                        }
                        aria-label="Next slide"
                    >
                        ›
                    </button>
                </div>
            </section>

            <section className="search">
                <div className="search-card">
                    <p className="eyebrow">Search</p>
                    <h2>Find your next event</h2>
                    <form className="search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Try “beach getaway” or “city weekend”"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search destinations"
                        />
                        <button type="submit">Search</button>
                    </form>
                </div>
            </section>

            <section className="choices">
                <header className="section-header">
                    <p className="eyebrow">Plan your next move</p>
                    <h2>Pick from these favorites</h2>
                    <p className="muted">
                        Three crowd-pleasers to get you started. Swap images and copy to
                        match your brand.
                    </p>
                </header>
                {isLoadingEvents ? (
                    <p className="muted">Loading choices…</p>
                ) : eventsError ? (
                    <p className="muted">{eventsError}</p>
                ) : featuredChoices.length ? (
                    <div className="choice-grid">
                        {featuredChoices.map((choice) => (
                            <article key={choice.title} className="choice-card">
                                <div
                                    className="choice-image"
                                    style={{ backgroundImage: `url(${choice.image})` }}
                                    role="img"
                                    aria-label={choice.title}
                                />
                                <div className="choice-body">
                                    <h3>{choice.title}</h3>
                                    <p>{choice.blurb}</p>
                                    <button type="button" className="ghost-btn">
                                        Learn more
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

function App() {
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');

    useEffect(() => {
        let isMounted = true;
        setIsLoadingEvents(true);
        fetch(EVENTS_URL)
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
                const entries = Object.entries(data);
                const mapped = entries.map(([title, blurb], idx) => ({
                    title: title || `Choice ${idx + 1}`,
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
                setEventsError('Could not load events right now.');
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
        <Routes>
            <Route
                path="/"
                element={
                    <HomePage
                        events={events}
                        isLoadingEvents={isLoadingEvents}
                        eventsError={eventsError}
                    />
                }
            />
            <Route path="/search" element={<EventsPage />} />
        </Routes>
    );
}

export default App;