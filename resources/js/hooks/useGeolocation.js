import { useState, useCallback } from 'react';

const ERROR_MESSAGES = {
    1: 'GeolocationPermissionDenied',
    2: 'GeolocationPositionUnavailable',
    3: 'GeolocationTimeout',
};

export default function useGeolocation() {
    const [loading, setLoading] = useState(false);
    const [errorKey, setErrorKey] = useState(null);
    const [coords, setCoords] = useState(null);

    const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    const request = useCallback(() => {
        if (!supported) {
            setErrorKey('GeolocationUnsupported');
            setCoords(null);
            return;
        }
        setLoading(true);
        setErrorKey(null);
        setCoords(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setErrorKey(null);
                setLoading(false);
            },
            (err) => {
                setErrorKey(ERROR_MESSAGES[err.code] ?? 'GeolocationUnknown');
                setCoords(null);
                setLoading(false);
            },
            { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 },
        );
    }, [supported]);

    return { supported, loading, errorKey, coords, request };
}
