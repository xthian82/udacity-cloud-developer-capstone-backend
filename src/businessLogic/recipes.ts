import {CreateRecipeRequest} from "../requests/CreateRecipeRequest";
import {RecipesAccess} from "../dataLayer/recipesAccess";
import {UpdateRecipeRequest} from "../requests/UpdateRecipeRequest";
import {RecipeUpdate} from "../models/RecipeUpdate";
import {ImagesAccess} from "../dataLayer/imagesAccess";
import {createLogger} from "../utils/logger";
import {User} from "../models/user";
import {RecipeItem} from "../models/RecipeItem";
import {S3UploadUrl} from "../models/S3UploadUrl";
import { v4 as uuidv4 } from 'uuid';
import {RecipeCreated} from "../models/RecipeCreated";

const recipesAccess = new RecipesAccess()
const imagesAccess = new ImagesAccess()
const logger = createLogger('businessRecipes')

export async function getRecipes(userId: string): Promise<RecipeItem[]> {
    return recipesAccess.getRecipes(userId)
}

export async function getRecipe(userId: string, recipeId: string): Promise<RecipeItem> {
    return recipesAccess.getRecipe(userId, recipeId)
}

export async function getPublicRecipe(recipeId: string): Promise<RecipeItem> {
    return recipesAccess.getPubRecipe(recipeId)
}

export async function createRecipe(createRecipeRequest: CreateRecipeRequest,
                                   user: User): Promise<RecipeCreated> {
    const recipeId = uuidv4() + "_" + new Date().getTime().toString()
    const recipeItem = await recipesAccess.createRecipe(user.userId, recipeId, {
        createdAt: new Date().toISOString(),
        publisher: user.name,
        title: createRecipeRequest.title,
        category: createRecipeRequest.category,
        attachmentUrl: createRecipeRequest.attachmentUrl,
        ingredients: createRecipeRequest.ingredients,
        socialRank: 0
    })

    return {
        recipeId,
        publisher: recipeItem.publisher,
        createdAt: recipeItem.createdAt
    }
}

export async function searchRecipes(querySearch: string): Promise<RecipeItem[]> {
    logger.info('searching recipes with query (', querySearch, ')')
    return querySearch ? recipesAccess.queryForRecipes(querySearch)
        : recipesAccess.mostPopularRecipes();
}

export async function updateRecipe(updateRecipeRequest: UpdateRecipeRequest,
                                   recipeId: string,
                                   userId: string): Promise<RecipeUpdate> {
    logger.info('updating recipe= [', recipeId, '], user= ', userId, ', data= ', updateRecipeRequest)
    const item = await recipesAccess.updateRecipe({
        title: updateRecipeRequest.title,
        category: updateRecipeRequest.category,
        attachmentUrl: updateRecipeRequest.attachmentUrl,
        ingredients: updateRecipeRequest.ingredients
    }, recipeId, userId)

    return item
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<void> {
    logger.warn('deleting recipe= [', recipeId, '], user=  ', userId, ', data= ')
    await recipesAccess.deleteRecipe(userId, recipeId)
}

export async function generateUrlImage(userId: string, recipeId: string): Promise<S3UploadUrl> {
    logger.info('Generating  url image for user ', userId, ', and recipe ', recipeId)

    const attachmentUrl = imagesAccess.getUploadUrl(recipeId)
    const signedUrl = imagesAccess.generateSignedUploadUrl(recipeId);

    return {
        uploadUrl: signedUrl,
        attachmentUrl: attachmentUrl
    }
}
