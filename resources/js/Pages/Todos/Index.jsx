import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import TodoItem from '@/Components/TodoItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/hooks/useTranslation';

function AddTodoForm({ listId }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        due_date: '',
        priority: 'normal',
        todo_list_id: listId ?? null,
    });

    const submit = (e) => {
        e.preventDefault();
        if (!data.title.trim()) return;
        post(route('todos.store'), {
            preserveScroll: true,
            onSuccess: () => reset('title', 'due_date'),
            transform: (form) => ({
                ...form,
                due_date: form.due_date === '' ? null : form.due_date,
                todo_list_id: listId ?? null,
            }),
        });
    };

    return (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
            <TextInput
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder={t('Add a todo…')}
                aria-label={t('New todo title')}
                className="min-w-0 flex-1 text-sm"
            />
            <select
                value={data.priority}
                onChange={(e) => setData('priority', e.target.value)}
                aria-label={t('Priority')}
                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
                {['low', 'normal', 'high', 'urgent'].map((p) => (
                    <option key={p} value={p}>
                        {t(p)}
                    </option>
                ))}
            </select>
            <TextInput
                type="date"
                value={data.due_date}
                onChange={(e) => setData('due_date', e.target.value)}
                aria-label={t('Due date')}
                className="text-sm"
            />
            <PrimaryButton disabled={processing || !data.title.trim()}>{t('Add')}</PrimaryButton>
        </form>
    );
}

function SubtaskRow({ subtask }) {
    const { t } = useTranslation();
    const done = subtask.status === 'done';

    return (
        <div className="flex items-center gap-2 ps-9">
            <button
                type="button"
                onClick={() =>
                    router.post(route(done ? 'todos.reopen' : 'todos.complete', subtask.id), {}, { preserveScroll: true })
                }
                aria-label={done ? t('Mark as not done') : t('Mark as done')}
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                    done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 text-transparent'
                }`}
            >
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414l2.792 2.793 6.793-6.793a1 1 0 011.415 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <span className={`text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {subtask.title}
            </span>
        </div>
    );
}

function TodoRow({ todo, onDragStart, onDrop }) {
    const { t } = useTranslation();
    const [showSubtaskInput, setShowSubtaskInput] = useState(false);
    const [subtaskTitle, setSubtaskTitle] = useState('');
    const [showConvert, setShowConvert] = useState(false);

    const addSubtask = (e) => {
        e.preventDefault();
        if (!subtaskTitle.trim()) return;
        router.post(
            route('todos.store'),
            { title: subtaskTitle, parent_id: todo.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubtaskTitle('');
                    setShowSubtaskInput(false);
                },
            },
        );
    };

    const convert = (freq) => {
        router.post(
            route('todos.convert', todo.id),
            { recurrence: freq === 'weekly' ? { freq, days: ['mon'] } : { freq } },
            { preserveScroll: true },
        );
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, todo)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, todo)}
            className="space-y-1 rounded-lg"
        >
            <div className="group relative">
                <TodoItem item={todo} showDate />
                <div className="absolute end-2 top-1/2 hidden -translate-y-1/2 gap-2 bg-white ps-2 group-hover:flex">
                    <button
                        type="button"
                        onClick={() => setShowSubtaskInput((v) => !v)}
                        className="text-xs text-gray-500 hover:text-emerald-600"
                    >
                        {t('+ subtask')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowConvert((v) => !v)}
                        className="text-xs text-gray-500 hover:text-emerald-600"
                    >
                        {t('Make routine')}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.delete(route('todos.destroy', todo.id), { preserveScroll: true })}
                        className="text-xs text-rose-400 hover:text-rose-600"
                    >
                        {t('Delete')}
                    </button>
                </div>
            </div>

            {todo.subtasks.map((sub) => (
                <SubtaskRow key={sub.id} subtask={sub} />
            ))}

            {showSubtaskInput && (
                <form onSubmit={addSubtask} className="flex gap-2 ps-9">
                    <TextInput
                        value={subtaskTitle}
                        onChange={(e) => setSubtaskTitle(e.target.value)}
                        placeholder={t('Subtask title')}
                        className="flex-1 text-sm"
                        autoFocus
                    />
                    <PrimaryButton>{t('Add')}</PrimaryButton>
                </form>
            )}

            {showConvert && (
                <div className="flex flex-wrap items-center gap-2 ps-9 text-sm">
                    <span className="text-gray-500">{t('Repeat')}:</span>
                    {[
                        ['daily', 'Every day'],
                        ['weekly', 'Weekly'],
                        ['monthly', 'Monthly'],
                    ].map(([freq, label]) => (
                        <button
                            key={freq}
                            type="button"
                            onClick={() => convert(freq)}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-200"
                        >
                            {t(label)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Index({ todos, lists, activeList }) {
    const { t } = useTranslation();
    const [newListName, setNewListName] = useState('');
    const [dragged, setDragged] = useState(null);

    const createList = (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        router.post(
            route('todo-lists.store'),
            { name: newListName },
            { preserveScroll: true, onSuccess: () => setNewListName('') },
        );
    };

    const onDragStart = (e, todo) => setDragged(todo);
    const onDrop = (e, target) => {
        if (!dragged || dragged.id === target.id) return;
        const ids = todos.map((todo) => todo.id).filter((id) => id !== dragged.id);
        const targetIndex = ids.indexOf(target.id);
        ids.splice(targetIndex, 0, dragged.id);
        router.post(route('todos.reorder'), { ids }, { preserveScroll: true });
        setDragged(null);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">{t('My Todos')}</h2>
            }
        >
            <Head title={t('Todos')} />

            <div className="py-6">
                <div className="mx-auto flex max-w-5xl gap-6 px-4 sm:px-6 lg:px-8">
                    <aside className="w-56 shrink-0 space-y-1">
                        <Link
                            href={route('todos.index')}
                            className={`block rounded-md px-3 py-2 text-sm ${
                                !activeList ? 'bg-emerald-100 font-medium text-emerald-900' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {t('All todos')}
                        </Link>
                        {lists.map((list) => (
                            <div key={list.id} className="group flex items-center">
                                <Link
                                    href={route('todos.index', { list: list.id })}
                                    className={`block flex-1 rounded-md px-3 py-2 text-sm ${
                                        activeList === list.id
                                            ? 'bg-emerald-100 font-medium text-emerald-900'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {list.name}
                                    <span className="ms-1 text-xs text-gray-400">{list.pending_count}</span>
                                </Link>
                                <button
                                    type="button"
                                    aria-label={t('Delete list')}
                                    onClick={() => router.delete(route('todo-lists.destroy', list.id), { preserveScroll: true })}
                                    className="hidden px-1 text-xs text-rose-400 group-hover:block"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <form onSubmit={createList} className="flex gap-1 pt-2">
                            <TextInput
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder={t('New list')}
                                aria-label={t('New list name')}
                                className="w-full text-sm"
                            />
                        </form>
                    </aside>

                    <main className="min-w-0 flex-1 space-y-4">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <AddTodoForm listId={activeList} />
                        </div>

                        <div className="space-y-2">
                            {todos.length === 0 && (
                                <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
                                    {t('Nothing here yet.')}
                                </div>
                            )}
                            {todos.map((todo) => (
                                <TodoRow key={todo.id} todo={todo} onDragStart={onDragStart} onDrop={onDrop} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
