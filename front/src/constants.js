export const fallbackImages = [
    'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1533144169699-97ec15a75e92?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1631179234473-f48fedffed9a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1626125345510-4603468eedfb?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];

export const segmentImageIndex = {
    Music: 1,
    Sports: 4,
    Arts: 0,
    'Arts & Theatre': 0,
    Theatre: 0,
    'Miscellaneous': 3,
    'Film': 2,
};

const API_BASE = 'http://localhost:8000';

export const EVENTS_URL = `${API_BASE}/events`;
export const SEARCH_URL = `${API_BASE}/events/search`;
export const eventDetailUrl = (id) => `${API_BASE}/events/${encodeURIComponent(id)}`;

export const LOGIN_URL = `${API_BASE}/token`;
export const REGISTER_URL = `${API_BASE}/register`;
export const DELETE_USER_URL = `${API_BASE}/delete_user`;
export const UPDATE_USER_URL = `${API_BASE}/update_user`;
export const USER_ME_URL = `${API_BASE}/user`;
