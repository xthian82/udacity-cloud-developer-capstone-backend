/**
 * Fields in a request to update a single Recipe item.
 */
export interface UpdateRecipeRequest {
    title: string
    category?: string
    attachmentUrl?: string
    ingredients?: [string]
}
