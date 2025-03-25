// components/RecipeCard.tsx

type RecipeCardProps = {
    title: string;
    image: string;
};

const RecipeCard = ({ title, image }: RecipeCardProps) => {
    return (
        <div
            className="bg-cover bg-center flex flex-col justify-end p-4 aspect-square rounded-xl"
            style={{
                backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0)), url(${image})`
            }}
        >
            <p className="text-white font-bold text-base leading-tight w-4/5 line-clamp-2">
                {title}
            </p>
        </div>
    );
};

export default RecipeCard;
