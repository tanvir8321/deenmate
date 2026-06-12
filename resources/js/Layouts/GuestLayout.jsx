import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-base-200 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-primary" />
                </Link>
            </div>

            <div className="card mt-6 w-full bg-base-100 shadow sm:max-w-md">
                <div className="card-body p-6">{children}</div>
            </div>
        </div>
    );
}
