import { Link } from 'react-router-dom';

const AddButton = () => {
    return (
        <Link
            to="/createRecipe"
            className="fixed bottom-10 right-5 z-50 inline-flex items-center h-14 px-6 rounded-full bg-[#F4C753] text-[#141C24] text-base font-bold gap-2 shadow-lg hover:shadow-xl transition duration-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 256 256"
            >
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
            </svg>
            <span className="hidden sm:inline">Добавить</span>
        </Link>
    );
};

export default AddButton;
