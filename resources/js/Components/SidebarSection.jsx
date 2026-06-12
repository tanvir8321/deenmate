export default function SidebarSection({ title, children }) {
    if (!children || (Array.isArray(children) && children.length === 0)) {
        return null;
    }
    return (
        <div className="px-2 pb-3">
            {title && (
                <h3 className="menu-title px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
                    {title}
                </h3>
            )}
            <ul className="menu menu-sm gap-0.5 p-0">{children}</ul>
        </div>
    );
}
