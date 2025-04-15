import { Router, Request, Response } from 'express';
import puppeteer from 'puppeteer';
import path from 'path';
import ejs from 'ejs';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import Recipe from '../models/Recipe';
import Ingredient from "../models/Ingredient";
import IngredientUnits from '../models/IngredientUnits';
import CookingTime from '../models/CookingTime';
import { Op } from 'sequelize';
import fs from 'fs';

const router = Router();

/**
 * Эндпоинт экспорта рецептов в PDF.
 */
router.post('/export-pdf', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { recipeIds } = req.body;
        if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
            res.status(400).json({ message: 'Необходимо передать массив recipeIds' });
            return;
        }


        const recipes = await Recipe.findAll({
            where: { recipe_id: recipeIds },
            include: [
                {
                    model: Ingredient,
                    as: 'ingredients',
                    through: { attributes: ['quantity', 'unit_id'] },
                },
                {
                    model: CookingTime,
                    as: 'cookingTime',
                }
            ]
        });

        // Собираем все уникальные unit_id из рецептов
        const unitIdsSet = new Set<number>();
        recipes.forEach(recipe => {
            const recipeObj: any = recipe.toJSON();
            if (recipeObj.ingredients) {
                recipeObj.ingredients.forEach((ing: any) => {
                    if (ing.RecipesIngredients && ing.RecipesIngredients.unit_id) {
                        unitIdsSet.add(ing.RecipesIngredients.unit_id);
                    }
                });
            }
        });
        const unitIds = Array.from(unitIdsSet);

        // Получаем единицы измерения
        const units = await IngredientUnits.findAll({
            where: { ing_unit_id: unitIds },
            attributes: ['ing_unit_id', 'name']
        });
        const unitMap: Record<number, string> = {};
        units.forEach(unit => {
            unitMap[unit.ing_unit_id] = unit.name;
        });


        const recipesData = recipes.map(recipe => {
            const data: any = recipe.toJSON();
            if (data.ingredients) {
                data.ingredients = data.ingredients.map((ing: any) => {
                    if (ing.RecipesIngredients && ing.RecipesIngredients.unit_id) {
                        ing.RecipesIngredients.unitName = unitMap[ing.RecipesIngredients.unit_id] || '';
                    }
                    return ing;
                });
            }
            data.main_image = data.main_image ? `/${data.main_image}` : '/default.jpg';
            return data;
        });

        // Рендерим шаблон EJS с полными данными рецептов
        const templatePath = path.join(__dirname, '..', 'views', 'recipes_pdf.ejs');
        const html = await ejs.renderFile(templatePath, { recipes: recipesData });


        // Запускаем Puppeteer для создания PDF
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        });
        const page = await browser.newPage();

        // Устанавливаем контент страницы
        await page.setContent(html, { waitUntil: 'networkidle0' });


        await new Promise<void>(resolve => setTimeout(resolve, 500));

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
        });


        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="recipes.pdf"',
            'Content-Length': pdfBuffer.length.toString(),
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
        });


        res.send(Buffer.from(pdfBuffer));
        return


    } catch (error) {
        console.error('Ошибка при генерации PDF:', error);
        res.status(500).json({ message: 'Ошибка при генерации PDF', detail: String(error) });
    }
});

export default router;
