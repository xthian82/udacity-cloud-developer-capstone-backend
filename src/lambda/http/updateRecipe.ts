import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'

import {UpdateRecipeRequest} from '../../requests/UpdateRecipeRequest'
import {createLogger} from "../../utils/logger";
import {updateRecipe} from "../../businessLogic/recipes";
import {getUser, hasAtLeastOneProp} from "../utils";

const logger = createLogger('updateRecipeFunc')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`processing event ${JSON.stringify(event)}`)
    const recipeId = event.pathParameters.recipeId
    const updatedRecipe: UpdateRecipeRequest = JSON.parse(event.body)
    const user = getUser(event)

    if (!hasAtLeastOneProp(updatedRecipe)) {
        logger.info(`invalid body ${JSON.stringify(event.body)}`)
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

    logger.info(`update recipe ${JSON.stringify(updatedRecipe)} for id ${recipeId} for user ${user.userId}`)
    const updatedItem = await updateRecipe(updatedRecipe, recipeId, user.userId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            ...updatedItem
        })
    }
}
