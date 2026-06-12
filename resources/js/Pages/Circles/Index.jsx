import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@/Components/Container';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import useTranslation from '@/hooks/useTranslation';

const SHARE_LEVELS = [
    { value: 'streak_only', label: 'Streak Only', tooltip: 'Only your current streak is visible to circle members.' },
    { value: 'percent', label: 'Percent', tooltip: 'Your daily completion percentage is visible to circle members.' },
    { value: 'full', label: 'Full', tooltip: 'Your full task list and statuses are visible to circle members.' },
];

function MemberCard({ member, isSelf, circleId }) {
    const { t } = useTranslation();
    const { processing, patch } = useForm();

    function handleShareChange(e) {
        patch(route('circles.share', circleId), {
            share_level: e.target.value,
        });
    }

    const levelInfo = SHARE_LEVELS.find((l) => l.value === member.share_level);

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-base-300 bg-base-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-base-content">{member.name}</span>
                    {isSelf && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary">
                            {t('You')}
                        </span>
                    )}
                </div>
                {isSelf ? (
                    <select
                        value={member.share_level}
                        onChange={handleShareChange}
                        disabled={processing}
                        className="rounded-md border-base-300 text-xs shadow-sm focus:border-primary focus:ring-primary"
                        title={levelInfo?.tooltip}
                    >
                        {SHARE_LEVELS.map((lvl) => (
                            <option key={lvl.value} value={lvl.value} title={lvl.tooltip}>
                                {lvl.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="text-xs text-base-content/60" title={levelInfo?.tooltip}>
                        {levelInfo?.label}
                    </span>
                )}
            </div>

            {member.share_level !== 'streak_only' && (
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-base-300">
                            <div
                                className="h-2 rounded-full bg-success/100 transition-all"
                                style={{ width: `${member.percent}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-sm font-medium text-base-content/80">
                        {member.done}/{member.total}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                        {member.percent}%
                    </span>
                </div>
            )}

            {member.share_level === 'streak_only' && member.total > 0 && (
                <div className="flex items-center gap-1 text-sm text-primary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('Active today')}</span>
                </div>
            )}
        </div>
    );
}

function CircleCard({ circle, userId }) {
    const { t } = useTranslation();
    const [confirmLeave, setConfirmLeave] = useState(false);

    function handleLeave() {
        router.post(route('circles.leave', circle.id), {}, {
            onSuccess: () => setConfirmLeave(false),
        });
    }

    return (
        <div className="rounded-lg bg-base-100 shadow">
            <div className="flex items-center justify-between border-b border-base-300 px-6 py-4">
                <div>
                    <h3 className="text-lg font-semibold text-base-content">{circle.name}</h3>
                    <p className="mt-1 text-sm text-base-content/60">
                        {t('Invite code')}:{' '}
                        <code className="rounded bg-base-200 px-2 py-0.5 font-mono text-base-content/80">
                            {circle.invite_code}
                        </code>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {circle.is_owner && (
                        <span className="rounded bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
                            {t('Owner')}
                        </span>
                    )}
                    {!confirmLeave ? (
                        <button
                            onClick={() => setConfirmLeave(true)}
                            className="rounded px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10"
                        >
                            {t('Leave')}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-base-content/60">{t('Are you sure?')}</span>
                            <button
                                onClick={handleLeave}
                                className="rounded bg-error px-2 py-1 text-xs font-medium text-base-content hover:bg-error/80"
                            >
                                {t('Yes')}
                            </button>
                            <button
                                onClick={() => setConfirmLeave(false)}
                                className="rounded px-2 py-1 text-xs font-medium text-base-content/60 hover:bg-base-200"
                            >
                                {t('No')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {circle.members.map((member) => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        isSelf={member.id === userId}
                        circleId={circle.id}
                    />
                ))}
            </div>
        </div>
    );
}

export default function CirclesIndex({ circles }) {
    const { t } = useTranslation();
    const { props } = usePage();
    const userId = props.auth.user.id;
    const success = props.flash?.success;

    const createForm = useForm({ name: '' });
    const joinForm = useForm({ invite_code: '' });

    const [showCreate, setShowCreate] = useState(circles.length === 0);
    const [showJoin, setShowJoin] = useState(circles.length === 0);

    function handleCreate(e) {
        e.preventDefault();
        createForm.post(route('circles.store'), {
            onSuccess: () => createForm.reset(),
        });
    }

    function handleJoin(e) {
        e.preventDefault();
        joinForm.post(route('circles.join'), {
            onSuccess: () => joinForm.reset(),
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-base-content">
                    {t('Circles')}
                </h2>
            }
        >
            <Head title={t('Circles')} />

            <Container className="space-y-4 py-2">
                    {success && (
                        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-primary">
                            {success}
                        </div>
                    )}

                    <div className="flex gap-4">
                        {circles.length > 0 && (
                            <button
                                onClick={() => setShowCreate(!showCreate)}
                                className="rounded-lg bg-base-100 px-4 py-2 text-sm font-medium text-base-content/80 shadow hover:bg-base-200"
                            >
                                + {t('Create Circle')}
                            </button>
                        )}
                        {circles.length > 0 && (
                            <button
                                onClick={() => setShowJoin(!showJoin)}
                                className="rounded-lg bg-base-100 px-4 py-2 text-sm font-medium text-base-content/80 shadow hover:bg-base-200"
                            >
                                + {t('Join Circle')}
                            </button>
                        )}
                    </div>

                    {(showCreate || showJoin) && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {showCreate && (
                                <form onSubmit={handleCreate} className="rounded-lg bg-base-100 p-6 shadow">
                                    <h3 className="mb-4 text-lg font-semibold text-base-content">{t('Create a circle')}</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="circle_name" value={t('Circle name')} />
                                            <TextInput
                                                id="circle_name"
                                                className="mt-1 block w-full"
                                                value={createForm.data.name}
                                                onChange={(e) => createForm.setData('name', e.target.value)}
                                                required
                                                placeholder={t('e.g. Accountability Group')}
                                            />
                                            <InputError message={createForm.errors.name} className="mt-1" />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <PrimaryButton disabled={createForm.processing}>
                                                {createForm.processing ? t('Creating...') : t('Create Circle')}
                                            </PrimaryButton>
                                            {circles.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCreate(false)}
                                                    className="text-sm text-base-content/60 hover:text-base-content/80"
                                                >
                                                    {t('Cancel')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            )}

                            {showJoin && (
                                <form onSubmit={handleJoin} className="rounded-lg bg-base-100 p-6 shadow">
                                    <h3 className="mb-4 text-lg font-semibold text-base-content">{t('Join a circle')}</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="invite_code" value={t('Invite code')} />
                                            <TextInput
                                                id="invite_code"
                                                className="mt-1 block w-full font-mono"
                                                value={joinForm.data.invite_code}
                                                onChange={(e) => joinForm.setData('invite_code', e.target.value)}
                                                required
                                                maxLength={8}
                                                placeholder="ABCD1234"
                                            />
                                            <InputError message={joinForm.errors.invite_code} className="mt-1" />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <PrimaryButton disabled={joinForm.processing}>
                                                {joinForm.processing ? t('Joining...') : t('Join Circle')}
                                            </PrimaryButton>
                                            {circles.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowJoin(false)}
                                                    className="text-sm text-base-content/60 hover:text-base-content/80"
                                                >
                                                    {t('Cancel')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {circles.length === 0 && (
                        <div className="rounded-lg bg-base-100 p-12 text-center shadow">
                            <p className="text-base-content/60">{t('You are not in any circles yet.')}</p>
                            <p className="mt-1 text-sm text-base-content/50">
                                {t('Create one or join with an invite code to get started.')}
                            </p>
                        </div>
                    )}

                    {circles.map((circle) => (
                        <CircleCard key={circle.id} circle={circle} userId={userId} />
                    ))}
            </Container>
        </AuthenticatedLayout>
    );
}
