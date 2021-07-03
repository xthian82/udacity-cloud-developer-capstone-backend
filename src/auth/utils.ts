import {decode} from 'jsonwebtoken'

import {JwtPayload} from './JwtPayload'
import {User} from "../models/user";

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUser(jwtToken: string): User {
    const decodedJwt = decode(jwtToken) as JwtPayload

    return {
        userId: decodedJwt.sub,
        name: decodedJwt.name
    }
}
