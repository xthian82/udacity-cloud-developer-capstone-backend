import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {RecipeItem} from "../models/RecipeItem";
import {RecipeUpdate} from "../models/RecipeUpdate";
import {createLogger} from "../utils/logger";

const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')

const recipesIndexName = process.env.RECIPES_INDEX_NAME
const recipeSocRankIndexName = process.env.RECIPES_RANK_INDEX_NAME
const recipeTitleIndexName = process.env.RECIPES_TITLE_INDEX_NAME

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('recipesDataLayer')

export class RecipesAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly recipesTable = process.env.RECIPES_TABLE) {
    }

    async getRecipes(userId: string): Promise<RecipeItem[]> {
        logger.info('Getting all recipes of user ', userId)
        const result = await this.docClient.query({
            TableName: this.recipesTable,
            IndexName: recipesIndexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as RecipeItem[]
    }

    async getRecipe(userId: string, recipeId: string): Promise<RecipeItem> {
        logger.info('Getting recipeId', recipeId, ' of user ', userId)
        const result = await this.docClient.get({
            TableName: this.recipesTable,
            Key: {
                'userId': userId,
                'recipeId': recipeId
            }
        }).promise()

        const item = result.Item
        return item as RecipeItem
    }

    async getPubRecipe(recipeId: string): Promise<RecipeItem> {
        logger.info('Getting public base ', recipeId)
        const result = await this.docClient.scan({
            TableName: this.recipesTable,
            IndexName: recipesIndexName,
            FilterExpression: 'recipeId = :recipeId',
            ExpressionAttributeValues: {
                ':recipeId': recipeId
            },
            Limit: 1
        }).promise()

        const item = result.Items
        return item[0] as RecipeItem
    }

    async createRecipe(userId: string, recipeId: string, recipeItem: RecipeItem): Promise<RecipeItem> {
        logger.info('Creating item ', JSON.stringify(recipeItem))
        const joinedIngs = recipeItem.ingredients ? recipeItem.ingredients.join('**') : undefined

        await this.docClient.put({
            TableName: this.recipesTable,
            Item: {userId, recipeId, ...recipeItem, titledIngs: recipeItem.title + '|' + joinedIngs}
        }).promise()

        return recipeItem as RecipeItem
    }

    async updateRecipe(recipeUpdate: RecipeUpdate,
                       recipeId: string,
                       userId: string): Promise<RecipeItem> {
        logger.info('updating item ', JSON.stringify(recipeUpdate))

        const currentItem = await this.getRecipe(userId, recipeId)
        if (!recipeUpdate.title) recipeUpdate.title = currentItem.title
        if (!recipeUpdate.ingredients) recipeUpdate.ingredients = ['']
        if (!recipeUpdate.attachmentUrl) recipeUpdate.attachmentUrl = ""
        if (!recipeUpdate.category) recipeUpdate.category = ""

        const joinedIngs = recipeUpdate.ingredients ? recipeUpdate.ingredients.join('**') : undefined

        await this.docClient.update({
                TableName: this.recipesTable,
                Key: {
                    "userId": userId,
                    "recipeId": recipeId
                },

                UpdateExpression: "SET #ns=:title, #dd=:category, #at=:attachmentUrl, #ig=:ingredients, #ji=:titledIngs",
                ExpressionAttributeValues: {
                    ":title": recipeUpdate.title,
                    ":category": recipeUpdate.category,
                    ":attachmentUrl": recipeUpdate.attachmentUrl,
                    ":ingredients": recipeUpdate.ingredients,
                    ":titledIngs": recipeUpdate.title + '|' + joinedIngs
                },
                ExpressionAttributeNames: {
                    "#ns": "title",
                    "#dd": "category",
                    "#at": "attachmentUrl",
                    "#ig": "ingredients",
                    "#ji": "titledIngs"
                },

                ReturnValues: "UPDATED_NEW"
            }, (err, _) => {
                if (err) {
                    logger.error("Unable to update item. Error JSON:", JSON.stringify(err));
                }
            }
        ).promise()

        return recipeUpdate as RecipeItem
    }

    async deleteRecipe(userId: string, recipeId: string): Promise<void> {
        logger.info('deleting item with Id ', recipeId)
        await this.docClient.delete({
            TableName: this.recipesTable,
            Key: {
                'userId': userId,
                'recipeId': recipeId
            }
        }, (err, _) => {
            if (err) {
                logger.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            }
        }).promise()
    }

    async queryForRecipes(querySearch: string): Promise<RecipeItem[]> {
        logger.info('querying (', querySearch, ')')
        const result = await this.docClient.scan({
            TableName: this.recipesTable,
            IndexName: recipeTitleIndexName,
            FilterExpression: 'contains(titledIngs, :containsStr)',
            //KeyConditionExpression: 'contains(titledIngs, :containsStr)',
            //KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':containsStr': querySearch
            },
            Limit: 100
        }).promise()

        const items = result.Items
        return items as RecipeItem[]
    }

    async mostPopularRecipes(): Promise<RecipeItem[]> {
        logger.info('Searching popular foodies')

        const result = await this.docClient.scan({
            TableName: this.recipesTable,
            IndexName: recipeSocRankIndexName,
            Limit: 20,
            FilterExpression: 'socialRank >= :socialRank',
            //KeyConditionExpression: 'socialRank >= :socialRank',
            //ScanIndexForward: false,
            ExpressionAttributeValues: {
                ':socialRank': 0
            }
        }).promise()

        const items = result.Items
        return items as RecipeItem[]
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
