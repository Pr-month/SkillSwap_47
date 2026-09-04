import { Category } from "src/categories/entities/category.entity";
import { AppDataSource } from "src/config/ormconfig";
import { CATEGORIES_SEED } from "src/categories/categories.data";

async function seedCategories() {

    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
    
    const categoriesRepo = AppDataSource.getRepository(Category);

    if ((await categoriesRepo.count()) > 0) {
        console.log('Сидинг категорий пропущен');
        return;
    }

    for (const parentData of CATEGORIES_SEED) {
        const parentCategory = categoriesRepo.create({
            name: parentData.name,
        });
        const savedParent = await categoriesRepo.save(parentCategory);

        // Добавляем дочерние категории
        if (parentData.children && parentData.children.length > 0) {
            const childrenToSave = parentData.children.map((childName) => {
                return categoriesRepo.create({
                name: childName,
                parent: savedParent,
                });
            });

            await categoriesRepo.save(childrenToSave);
        }
    }

    console.log('Сидинг категорий успешно завершен');
}

seedCategories()
    .catch((error) => console.error(`Ошибка сидинга категорий: ${error}`))
    .finally(() => {
        if (AppDataSource.isInitialized) {
            void AppDataSource.destroy();
        }
    });