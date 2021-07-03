import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import 'source-map-support/register';

import {getPublicRecipe} from "../../businessLogic/recipes";
import {createLogger} from "../../utils/logger";

const logger = createLogger('getPublicRecipeFunc')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event)

    // const uuid = event.pathParameters.uuid
    const recipeId = event.pathParameters.recipeId

    logger.info(`Getting base recipe ${recipeId} data`)

    const recipe = await getPublicRecipe(recipeId)

    if (!recipe) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: 'No recipe found'
        }
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items: recipe
        })
    }

}
