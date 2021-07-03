import {APIGatewayProxyEvent} from "aws-lambda";
import {parseUser} from "../auth/utils";
import {User} from "../models/user";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUser(event: APIGatewayProxyEvent): User {
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    return parseUser(jwtToken)
}

export function hasAtLeastOneProp(item): boolean {
    return    !isEmpty(item.title)
           || !isEmpty(item.ingredients)
           || !isEmpty(item.category)
           || !isEmpty(item.attachmentUrl);
}

function isEmpty(str): boolean {
    return !str || str.length === 0;
}
