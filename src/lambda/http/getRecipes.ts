import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import {getRecipes} from "../../businessLogic/recipes";
import {getUser} from "../utils";

const logger = createLogger('getRecipesFunc')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info('Getting all recipes by user ')
    const user = getUser(event)
    const recipes = await getRecipes(user.userId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items: recipes
        })
    }
}
