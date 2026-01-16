import { useEffect, useState } from 'react';
import {Navigate, Outlet, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import EventsPage from './EventsPage';
import { EVENTS_URL, fallbackImages, eventImageIndex  } from './constants';
import LoginPage from './LoginPage';
import {useAuth} from './AuthContext';
import OneEventPage from "./OneEventPage";
import RegisterUser from "./RegisterUser";
import UserPage from './UserPage';

const heroSlides = [
    {
        title: 'Odkryj sztukę w teatrze',
        description: 'Magia sceny, emocje na żywo i niezapomniane spektakle.',
        image:
            'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        title: 'Odkryj wydarzenia muzyczne',
        description: 'Koncerty na żywo, festiwale i dźwięki, które poruszają.',
        image:
            'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        title: 'Odkryj wydarzenia kulturalne',
        description: 'Spotkania ze sztuką, teatrem i kulturą na żywo.',
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
        const id = setInterval(() => {
            setActiveIndex((prev) => (prev === lastIndex ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(id);
    }, [lastIndex]);

    

    const handleSearch = (event) => {
        event.preventDefault();
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    };
    
    const handleLogin = (event) => {
        event.preventDefault();
        navigate('/login');
    }

    const handleRegister = (event) => {
        event.preventDefault();
        navigate('/register');
    }
    
    const handleShowUser = (event) => {
        event.preventDefault();
        navigate('/user');
    }
    
    
    
    const featuredChoices = events.slice(0, 3);

    const handleOneEvent = (id) => {
        navigate(`/event?q=${encodeURIComponent(id)}`)
    };

    return (
        <div className="page">
            <section className="heading">
                <div className="heading-one">
                    
            {user ? (
                <>
                    <div className="login-name">
                    Zalogowany jako&nbsp; <b>{user.username}</b>

                    </div>
                    <button type="button" className="ghost-btn" onClick={logout}>Wyloguj</button>
                    
                </>
            ):(
                <>
                <button type="button" className="ghost-btn" onClick={handleLogin}>
                    Logowanie
                </button> 
                
                <button type="button" className="ghost-btn" onClick={handleRegister}>
                    Rejestracja
                </button>
                </>
            )}
                    <button type="button" className="ghost-btn" onClick={handleShowUser}>Moje dane</button>

                </div>
                <div className="heading-two">
                <section className="buttons-sth">  
                    {/*<button type="button" className="ghost-btn">*/}
                    {/*    ENG/PL*/}
                    {/*</button>*/}

                    <button
                        type="button"
                        className={`toggle ${themeOn ? "is-on" : ""}`}
                        onClick={toggleTheme}
                        aria-label="Motyw"
                    >
                        <span className="toggle-knob" />
                    </button>
                </section>
            </div>
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
                                <p className="eyebrow">Warte uwagi</p>
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
                    <p className="eyebrow">Odkryj</p>
                    <h2>Odkryj swoje kolejne wydarzenie</h2>
                    <form className="search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Wpisz “koncert” albo “Warszawa”"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search destinations"
                        />
                        <button type="submit">Szukaj</button>
                    </form>
                </div>
            </section>

            <section className="choices">
                <header className="section-header">
                    <p className="eyebrow">Zaplanuj swój następny krok</p>
                    <h2>Wybierz coś z ulubionych</h2>
                    <p className="muted">
                        Trzy sprawdzone propozycje eventów do wyboru na start.
                    </p>
                </header>
                {isLoadingEvents ? (
                    <p className="muted">Loading choices…</p>
                ) : eventsError ? (
                    <p className="muted">{eventsError}</p>
                ) : featuredChoices.length ? (
                    <div className="choice-grid">
                        {featuredChoices.map((choice) => (
                            <article key={choice.id} className="choice-card">
                                <div
                                    className="choice-image"
                                    style={{ backgroundImage: `url(${
                                            fallbackImages[eventImageIndex[choice.rodzaj] ?? 0]
                                        })` }}
                                    role="img"
                                    aria-label={choice.title}
                                />
                                <div className="choice-body">
                                    <h3>{choice.title}</h3>
                                    <p>{choice.blurb}</p>
                                    <button 
                                        type="button" 
                                        className="ghost-btn"
                                    onClick={() => handleOneEvent(choice.id)}>
                                        Zobacz więcej!
                                    </button>
                                </div>
                                
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="muted">Obecnie brak dostępnych wydarzeń.</p>
                )}
            </section>
        </div>
    );
}

function App() {
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState('');

    function RequireAuth() {
        const location = useLocation();
        const token = localStorage.getItem("access_token");

        if(!token) {
            return <Navigate to='/login' replace state={{ from: location }}/>
        }
        return <Outlet/>
    }
    
    
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
                const mapped = entries.map(([key, ev], idx) => ({
                    id: key,
                    title: ev.miejsce,
                    blurb: `${ev.rodzaj} - ${ev.data}`,
                    rodzaj: ev.rodzaj


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
            
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/event" element={<OneEventPage/>} />
            
            <Route path="/register" element={<RegisterUser />} />
            
            <Route element={<RequireAuth />}>
                <Route path="/user" element={<UserPage/>}/>
            </Route>
            
        </Routes>
        
        
    );
}

export default App;