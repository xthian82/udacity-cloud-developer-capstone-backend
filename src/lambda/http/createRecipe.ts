import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'

import {CreateRecipeRequest} from '../../requests/CreateRecipeRequest'
import {getUser, hasAtLeastOneProp} from "../utils";
import {createLogger} from "../../utils/logger";
import {createRecipe} from "../../businessLogic/recipes";

const logger = createLogger('createRecipeFunc')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newRecipe: CreateRecipeRequest = JSON.parse(event.body)
    const user = getUser(event)

    if (!hasAtLeastOneProp(newRecipe)) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                item: 'please specify at least a property'
            })
        }
    }

    logger.info('creating recipe ', JSON.stringify(newRecipe), ' for user ', user.userId)
    const newItem = await createRecipe(newRecipe, user)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: {
                recipeId: newItem.recipeId,
                createdAt: newItem.createdAt
            }
        })
    }
}
