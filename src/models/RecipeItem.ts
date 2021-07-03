export interface RecipeItem {
    recipeId?: string
    createdAt: string
    title: string
    publisher: string
    category?: string
    attachmentUrl?: string
    ingredients?: [string]
    socialRank?: number
}
