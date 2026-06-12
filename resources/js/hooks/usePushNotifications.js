import { useState, useCallback } from 'react';

export function usePushNotifications() {
    const [subscription, setSubscription] = useState(null);
    const [supported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window);

    const subscribe = useCallback(async () => {
        if (!supported) {
            return { error: 'Push notifications not supported.' };
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return { error: 'Notification permission denied.' };
        }

        const registration = await navigator.serviceWorker.ready;
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (! vapidKey) {
            return { error: 'VAPID public key not configured.' };
        }

        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        const response = await fetch('/push-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
            body: JSON.stringify(sub.toJSON()),
        });

        if (! response.ok) {
            return { error: 'Failed to save subscription on server.' };
        }

        setSubscription(sub);
        return { subscription: sub };
    }, [supported]);

    const unsubscribe = useCallback(async () => {
        if (subscription) {
            await subscription.unsubscribe();
            setSubscription(null);
        }

        await fetch('/push-subscription', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
            body: JSON.stringify({ endpoint: subscription?.endpoint }),
        });
    }, [subscription]);

    const test = useCallback(async () => {
        const response = await fetch('/push-subscription/test', {
            method: 'POST',
            headers: {
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
        });
        return response.json();
    }, []);

    return { subscription, supported, subscribe, unsubscribe, test };
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}