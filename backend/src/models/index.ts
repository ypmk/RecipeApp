import User from "./User"
import Recipe from "./Recipe"
import RecipeUser from "./RecipeUser";
import Ingredient from "./Ingredient"
import IngredientUnits from "./IngredientUnits";
import RecipesIngredients from "./RecipesIngredients";
import MealTypes from "./MealTypes";
import MealPlans from "./MealPlans";
import MealPlanRecipes from "./MealPlanRecipes";
import RecipesMealTypes from "./RecipesMealTypes";
import ShoppingItems from "./ShoppingItems";
import ShoppingLists from "./ShoppingLists";
import CollectionUsers from "./CollectionUsers";
import Collections from "./Collections";
import CollectionsRecipes from "./CollectionsRecipes";
import RecipeImage from "./RecipeImage";


/** ---------- Связи между User и Recipe через RecipeUser ---------- */
User.belongsToMany(Recipe, {
    through: RecipeUser,
    foreignKey: 'user_id',
    otherKey: 'recipe_id',
});
Recipe.belongsToMany(User, {
    through: RecipeUser,
    foreignKey: 'recipe_id',
    otherKey: 'user_id',
});

/** ---------- Связи между Recipes и Ingredients через RecipesIngredients ---------- */
Recipe.belongsToMany(Ingredient, {
    through: RecipesIngredients,
    foreignKey: 'recipe_id',
    otherKey: 'ingredient_id',
    as: 'ingredients'
});
Ingredient.belongsToMany(Recipe, {
    through: RecipesIngredients,
    foreignKey: 'ingredient_id',
    otherKey: 'recipe_id',
    as: 'recipes',
});

/** ---------- Связи между Recipes и Images ---------- */
Recipe.hasMany(RecipeImage, {
    foreignKey: 'recipe_id',
    as: 'images',
});
RecipeImage.belongsTo(Recipe, {
    foreignKey: 'recipe_id',
    as: 'recipe',
});


/** ---------- Связь Ingredient -> IngredientUnits (многие к одному) ----------
 *  Предположим, что в таблице Ingredients есть столбец unit_id, который ссылается на ing_unit_id.
 *  Если в диаграмме именно так, нужно добавить это поле в модель Ingredient.
 *  Пример (в Ingredient.ts):
 *     declare unit_id: number;
 *  Тогда:
 */
Ingredient.belongsTo(IngredientUnits, { foreignKey: 'unit_id' });
IngredientUnits.hasMany(Ingredient, { foreignKey: 'unit_id' });

/** ---------- Связи между Recipes и MealTypes через RecipesMealTypes ---------- */
Recipe.belongsToMany(MealTypes, {
    through: RecipesMealTypes,
    foreignKey: 'recipe_id',
    otherKey: 'meal_type_id',
});
MealTypes.belongsToMany(Recipe, {
    through: RecipesMealTypes,
    foreignKey: 'meal_type_id',
    otherKey: 'recipe_id',
});

/** ---------- Связь User -> ShoppingLists (один ко многим) ---------- */
User.hasMany(ShoppingLists, { foreignKey: 'user_id' });
ShoppingLists.belongsTo(User, { foreignKey: 'user_id' });

/** ---------- Связь ShoppingLists -> ShoppingItems (один ко многим) ---------- */
ShoppingLists.hasMany(ShoppingItems, { foreignKey: 'shopping_list_id' });
ShoppingItems.belongsTo(ShoppingLists, { foreignKey: 'shopping_list_id' });

/** ---------- Связь ShoppingItems -> Ingredient (многие к одному) ---------- */
Ingredient.hasMany(ShoppingItems, { foreignKey: 'ingredient_id' });
ShoppingItems.belongsTo(Ingredient, { foreignKey: 'ingredient_id' });

/** ---------- Связь User -> MealPlans (один ко многим) ---------- */
User.hasMany(MealPlans, { foreignKey: 'user_id' });
MealPlans.belongsTo(User, { foreignKey: 'user_id' });

/** ---------- Связь MealPlans -> MealPlanRecipes (один ко многим) ---------- */
MealPlans.hasMany(MealPlanRecipes, { foreignKey: 'meal_plan_id' });
MealPlanRecipes.belongsTo(MealPlans, { foreignKey: 'meal_plan_id' });


Recipe.hasMany(MealPlanRecipes, { foreignKey: 'recipe_id' });
MealPlanRecipes.belongsTo(Recipe, { foreignKey: 'recipe_id' });

/** ---------- Связь CollectionsListPage <-> Users через CollectionUsers (many-to-many) ---------- */
User.belongsToMany(Collections, {
    through: CollectionUsers,
    foreignKey: 'user_id',
    otherKey: 'collection_id',
});
Collections.belongsToMany(User, {
    through: CollectionUsers,
    foreignKey: 'collection_id',
    otherKey: 'user_id',
});

/** ---------- Связь CollectionsListPage <-> Recipes через CollectionsRecipes (many-to-many) ---------- */
Collections.belongsToMany(Recipe, {
    through: CollectionsRecipes,
    foreignKey: 'collection_id',
    otherKey: 'recipe_id',
    as: 'recipes'
});
Recipe.belongsToMany(Collections, {
    through: CollectionsRecipes,
    foreignKey: 'recipe_id',
    otherKey: 'collection_id',
    as: 'recipes'
});

/**
 * Экспортируем модели, чтобы использовать их в других частях приложения.
 * (Например, в контроллерах, сервисах и т.д.)
 */
export {
    User,
    Recipe,
    RecipeUser,
    Ingredient,
    RecipesIngredients,
    IngredientUnits,
    MealTypes,
    RecipesMealTypes,
    ShoppingLists,
    ShoppingItems,
    MealPlans,
    MealPlanRecipes,
    Collections,
    CollectionUsers,
    CollectionsRecipes,
};