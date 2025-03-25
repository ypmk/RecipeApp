// components/RecipeGrid.tsx
import RecipeCard from './RecipeCard';

const recipes = [
    {
        title: 'Блинчики с мясом',
        image: 'https://cdn.usegalileo.ai/sdxl10/e7f89631-695c-426e-aec9-604131ab1e87.png',
    },
    {
        title: 'Блинчики с малиной',
        image: 'https://cdn.usegalileo.ai/sdxl10/09f0cb3b-d6dc-4210-9404-a3dfac1d2284.png',
    },
    {
        title: 'Блинчики по-домашнему',
        image: 'https://cdn.usegalileo.ai/sdxl10/e006e911-66f2-48b0-8a41-6f6fabb265a2.png',
    },
    {
        title: 'Название',
        image: 'https://cdn.usegalileo.ai/sdxl10/096f9b60-03e1-4f47-9428-119780298640.png',
    },
    // Добавь свои данные при необходимости
];

const RecipeGrid = () => {
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
            {recipes.map((recipe, idx) => (
                <RecipeCard key={idx} {...recipe} />
            ))}
        </div>
    );
};

export default RecipeGrid;
