// Copyright (C) 2020 Authlete, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { AuthleteApiFactory, AuthorizationDecisionHandler, ContentType, User } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { UserDao } from '../db/user_dao.ts';
import { AuthorizationDecisionHandlerSpiImpl } from '../impl/authorization_decision_handler_spi_impl.ts';
import { badRequest, BaseEndpoint, Task } from './base_endpoint.ts';
import Params = AuthorizationDecisionHandler.Params;


/**
 * Get the value for the key from the session and remove it from the
 * session. When the key doesn't exist in the session, an error will
 * be thrown if `throwErrorOnKeyMissing` is set to true. Otherwise,
 * `null` is returned.
 */
function takeAttribute(
    session: Map<string, any>, key: string, throwErrorOnKeyMissing = false): any
{
    if (session.has(key))
    {
        // Retrieve the value from the session.
        const value = session.get(key);

        // Remove the attribute from the session.
        session.delete(key);

        // Return the value.
        return value;
    }

    // No such key exists in the session.

    if (throwErrorOnKeyMissing)
    {
        // The value must be present in the session.
        throw badRequest(`${key} must be present in the session.`);
    }

    return null;
}


/**
 * Authenticate a user with the login ID and password contained in the
 * request body.
 */
function authenticateUser(session: Map<string, any>, reqBody: any): User | null
{
    // Extract login credentials from the request.
    const loginId  = reqBody['loginId'] || null;
    const password = reqBody['password'] || null;

    // Look up an end-user who has the login credentials.
    const loginUser = UserDao.getByCredentials(loginId, password);

    if (loginUser)
    {
        // Set the user info to the session.
        session.set('user', loginUser);
        session.set('authTime', new Date());
    }

    return loginUser;
}


/**
 * This method first tried to get user info from the current session.
 * If it was not found in the session, this method tries to look up
 * user info using user credentials contained in the request body.
 */
function getUser(session: Map<string, any>, reqBody: any): User | null
{
    // Look up the user in the session to see if they're already logged in.
    const sessionUser: User | undefined = session.get('user');

    // If a user exists in the session.
    if (sessionUser) return sessionUser;

    // Authenticate a user with the user credentials (ID and password)
    // contained in the request body.
    return authenticateUser(session, reqBody);
}


/**
 * The endpoint that receives a request from the form in the authorization
 * page.
 */
export class AuthorizationDecisionEndpoint extends BaseEndpoint
{
    /**
     * Process a request from the form in the authorization page.
     *
     * Note that a better implementation would re-display the authorization
     * page when the pair of login ID and password is wrong, but this
     * implementation does not do it for brevity. A much better implementation
     * would check the login credentials by Ajax.
     */
    public async post()
    {
        await this.process(<Task>{ execute: async () => {
            // Ensure the content type of the request is 'application/x-www-form-urlencoded'.
            this.ensureContentType(ContentType.APPLICATION_FORM_URLENCODED);

            // The request body.
            const reqBody = this.context.reqBody as { [key: string]: string };

            // The existing session.
            const session = this.context.data.get('session');

            // The parameters passed to the 'handle' method of AuthorizationDecisionHandler.
            const params: Params = takeAttribute(session, 'params', true);

            // The end-user who authorized or denied the client application's request.
            const user: User | null = getUser(session, reqBody);

            // The time when the end-user was authenticated.
            const authTime: Date | null = session.get('authTime');

            // The ID Token claims requested by the client application. The value is a JSON string.
            const idTokenClaims = params.idTokenClaims || null;

            // The list of ACRs (Authentication Context Class References) requested
            // by the client application.
            const acrs: string[] | null = takeAttribute(session, 'acrs');

            // Implementation of AuthorizationDecisionHandlerSpi.
            const spi = new AuthorizationDecisionHandlerSpiImpl(reqBody, user, authTime, idTokenClaims, acrs);

            // Authlete API client.
            const api = await AuthleteApiFactory.getDefault();

            // Handle the request.
            return await new AuthorizationDecisionHandler(api, spi).handle(params);
        }});
    }
}