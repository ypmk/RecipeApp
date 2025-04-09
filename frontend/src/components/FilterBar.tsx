// components/FilterBar.tsx

const filters = ["Фильтры", "Сортировка", "По коллекциям"];

const FilterBar = () => {
    return (
        <div className="flex gap-3 p-3 overflow-x-auto">
            {filters.map((label) => (
                <button
                    key={label}
                    className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#E4E9F1] pl-4 pr-2"
                >
                    <span className="text-[#141C24] text-sm font-medium leading-normal">{label}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20px"
                        height="20px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                        className="text-[#141C24]"
                    >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
