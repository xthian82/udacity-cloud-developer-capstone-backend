/**
 * Fields in a request to create a single Recipe item.
 */
export interface CreateRecipeRequest {
    recipeId: string,
    title: string
    category?: string
    attachmentUrl?: string
    ingredients?: [string]
}
