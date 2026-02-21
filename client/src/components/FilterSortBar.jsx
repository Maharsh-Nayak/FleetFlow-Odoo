import React from 'react';
import { createPortal } from 'react-dom'; // 1. Added Portal import
import { HiOutlineFilter, HiOutlineSortDescending, HiOutlineChevronDown, HiOutlineX } from 'react-icons/hi';

export default function FilterSortBar({
    filters = [],
    sortOptions = [],
    groupOptions = [],
    onFilterChange,
    onSortChange,
    onGroupChange,
    activeFilters = {},
    activeSort = '',
    activeGroup = ''
}) {
    const [openDropdown, setOpenDropdown] = React.useState(null);
    const [dropdownPos, setDropdownPos] = React.useState({ top: 0, left: 0 });

    const containerRef = React.useRef(null); // Ref for the buttons
    const dropdownRef = React.useRef(null);  // Ref for the portal dropdown

    // 2. Updated click outside to check BOTH the buttons and the portal
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedOutsideButtons = containerRef.current && !containerRef.current.contains(event.target);
            const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);

            if (clickedOutsideButtons && clickedOutsideDropdown) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 3. Optional but recommended: close dropdown on scroll since it's now fixed
    React.useEffect(() => {
        const handleScroll = () => {
            if (openDropdown) setOpenDropdown(null);
        };
        // Use capture phase to catch scrolls on internal containers
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [openDropdown]);

    // 4. Update positioning to be relative to the viewport (fixed), not the parent div
    React.useEffect(() => {
        if (openDropdown && containerRef.current) {
            // Find the specific button that was clicked
            const buttons = containerRef.current.querySelectorAll('button');
            let targetButton;

            if (openDropdown === 'filter') targetButton = buttons[0];
            else if (openDropdown === 'sort') targetButton = buttons[1];
            else if (openDropdown === 'group') targetButton = buttons[2];

            if (targetButton) {
                const buttonRect = targetButton.getBoundingClientRect();
                setDropdownPos({
                    top: buttonRect.bottom + 8, // viewport-relative top
                    left: buttonRect.left       // viewport-relative left
                });
            }
        }
    }, [openDropdown]);

    const handleFilterSelect = (filterKey, value) => {
        onFilterChange({ ...activeFilters, [filterKey]: value });
    };

    const clearAllFilters = () => {
        onFilterChange({});
        onSortChange('');
        onGroupChange('');
        setOpenDropdown(null);
    };

    const hasActiveFilters = Object.keys(activeFilters).some(k => activeFilters[k] && activeFilters[k] !== 'all');
    const hasActiveSort = activeSort && activeSort !== 'default';
    const hasActiveGroup = activeGroup && activeGroup !== 'none';
    const filterCount = Object.keys(activeFilters).filter(k => activeFilters[k] && activeFilters[k] !== 'all').length;

    const renderOptionList = (options, activeValue, onSelect, defaultValue = 'default', defaultLabel = 'Default') => (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '4px' }}>
            <button
                onClick={() => { onSelect(defaultValue); setOpenDropdown(null); }}
                style={{
                    padding: '10px 14px',
                    background: activeValue === defaultValue ? 'var(--bg-glass-hover)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeValue === defaultValue ? 'var(--primary-400)' : 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: activeValue === defaultValue ? 600 : 400,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
                className="dropdown-item"
            >
                {defaultLabel}
                {activeValue === defaultValue && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-500)' }} />}
            </button>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => { onSelect(opt.value); setOpenDropdown(null); }}
                    style={{
                        padding: '10px 14px',
                        background: activeValue === opt.value ? 'var(--bg-glass-hover)' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: activeValue === opt.value ? 'var(--primary-400)' : 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: activeValue === opt.value ? 600 : 400,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                    className="dropdown-item"
                >
                    {opt.label}
                    {activeValue === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-500)' }} />}
                </button>
            ))}
        </div>
    );

    const renderDropdownContent = () => {
        if (openDropdown === 'filter') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filters.map((filter) => (
                        <div key={filter.key} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{filter.label}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                <button
                                    onClick={() => handleFilterSelect(filter.key, 'all')}
                                    style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        border: '1px solid ' + (activeFilters[filter.key] === 'all' || !activeFilters[filter.key] ? 'var(--primary-500)' : 'var(--border-default)'),
                                        background: activeFilters[filter.key] === 'all' || !activeFilters[filter.key] ? 'var(--primary-900)' : 'transparent',
                                        color: activeFilters[filter.key] === 'all' || !activeFilters[filter.key] ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    All
                                </button>
                                {filter.options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleFilterSelect(filter.key, opt.value)}
                                        style={{
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            border: '1px solid ' + (activeFilters[filter.key] === opt.value ? 'var(--primary-500)' : 'var(--border-default)'),
                                            background: activeFilters[filter.key] === opt.value ? 'var(--primary-900)' : 'transparent',
                                            color: activeFilters[filter.key] === opt.value ? 'white' : 'var(--text-secondary)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            );
        }
        if (openDropdown === 'sort') return renderOptionList(sortOptions, activeSort, onSortChange, 'default', 'Default Order');
        if (openDropdown === 'group') return renderOptionList(groupOptions, activeGroup, onGroupChange, 'none', 'No Grouping');
        return null;
    };

    return (
        <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <style>
                {`
                    .dropdown-item:hover {
                        background: var(--bg-glass) !important;
                        color: var(--primary-400) !important;
                    }
                `}
            </style>
            {filters.length > 0 && (
                <button
                    className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '0.85rem', height: 40 }}
                    onClick={() => setOpenDropdown(openDropdown === 'filter' ? null : 'filter')}
                >
                    <HiOutlineFilter size={16} />
                    <span>Filter</span>
                    {filterCount > 0 && (
                        <span style={{
                            background: 'white',
                            color: 'var(--primary-600)',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800
                        }}>{filterCount}</span>
                    )}
                    <HiOutlineChevronDown size={14} style={{ opacity: 0.5, marginLeft: 4 }} />
                </button>
            )}

            {sortOptions.length > 0 && (
                <button
                    className={`btn ${hasActiveSort ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '0.85rem', height: 40 }}
                    onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                >
                    <HiOutlineSortDescending size={16} />
                    <span>Sort</span>
                    <HiOutlineChevronDown size={14} style={{ opacity: 0.5, marginLeft: 4 }} />
                </button>
            )}

            {groupOptions.length > 0 && (
                <button
                    className={`btn ${hasActiveGroup ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 14px', fontSize: '0.85rem', height: 40 }}
                    onClick={() => setOpenDropdown(openDropdown === 'group' ? null : 'group')}
                >
                    <span>Group</span>
                    <HiOutlineChevronDown size={14} style={{ opacity: 0.5, marginLeft: 4 }} />
                </button>
            )}

            {(hasActiveFilters || hasActiveSort || hasActiveGroup) && (
                <button
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.85rem', color: 'var(--danger)', height: 40 }}
                    onClick={clearAllFilters}
                >
                    <HiOutlineX size={16} />
                    Clear
                </button>
            )}

            {/* 5. Render the dropdown via createPortal outside of the DOM hierarchy */}
            {openDropdown && typeof window !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed', // Fixed instead of absolute
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        zIndex: 99999, // Ensure it's on top of EVERYTHING
                        background: 'rgba(30, 31, 37, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 12,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                        minWidth: openDropdown === 'filter' ? 240 : 200,
                        animation: 'pageIn 0.2s ease'
                    }}
                >
                    {renderDropdownContent()}
                </div>,
                document.body
            )}
        </div>
    );
}