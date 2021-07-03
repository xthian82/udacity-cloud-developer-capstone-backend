import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import 'source-map-support/register';
import {getUser} from "../utils";
import {getRecipe} from "../../businessLogic/recipes";
import {createLogger} from "../../utils/logger";

const logger = createLogger('getRecipeFunc')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event)

    const recipeId = event.pathParameters.recipeId

    logger.info(`Getting recipe ${recipeId}`)

    const user = getUser(event)
    const recipe = await getRecipe(user.userId, recipeId)

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
