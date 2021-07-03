import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import {searchRecipes} from '../../businessLogic/recipes';
import {createLogger} from "../../utils/logger";

const logger = createLogger('searchRecipesFunc')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', JSON.stringify(event))
    const query = event.queryStringParameters ? event.queryStringParameters["q"] : undefined
    logger.info('QueryString ', event.queryStringParameters)
    const recipes = await searchRecipes(query)

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
