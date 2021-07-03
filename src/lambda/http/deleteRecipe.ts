import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import {getUser} from "../utils";
import {deleteRecipe} from "../../businessLogic/recipes";

const logger = createLogger('deleteRecipeFunc')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const recipeId = event.pathParameters.recipeId

    const user = getUser(event)

    logger.info('deleting recipe id ', recipeId, ' for user ', user.userId)
    await deleteRecipe(recipeId, user.userId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: ''
    }
}
