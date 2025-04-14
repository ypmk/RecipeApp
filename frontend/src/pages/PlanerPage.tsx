import React from 'react';
import Header from "../components/Header.tsx";
import MealPlanList from "../components/MealPlanList.tsx";
import MealPlanCreateButton from "../components/MealPlanCreateButton.tsx";


const PlanerPage: React.FC = () => {
    return (
        <div>
            <Header />
            <div className="flex items-center gap-6 mt-10 justify-center">
                <h2 className="text-2xl font-bold">Ваши планеры</h2>
                <MealPlanCreateButton />
            </div>
            <main className="max-w-4xl mx-auto px-8 mt-18">
                <MealPlanList />
            </main>
        </div>
    );
};

export default PlanerPage;
