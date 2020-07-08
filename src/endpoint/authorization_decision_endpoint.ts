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


import { AuthorizationDecisionHandler as Handler, badRequest, User } from 'https://deno.land/x/authlete_deno/mod.ts';
import { UserDao } from '../db/user_dao.ts';
import { AuthorizationDecisionHandlerSpiImpl as SpiImpl } from '../impl/authorization_decision_handler_spi_impl.ts';
import { BaseEndpoint } from './base_endpoint.ts';
import Params = Handler.Params;


/**
 * Get the value for the key from the session and remove it from the
 * session. When the key doesn't exist in the session, an error will
 * be thrown if `throwErrorOnKeyMissing` is set to true. Otherwise,
 * `null` is returned.
 */
function takeAttribute(session: Map<string, any>, key: string)
{
    if (!session.has(key)) return null;

    // Retrieve the value from the session.
    const value = session.get(key);

    // Remove the attribute from the session.
    session.delete(key);

    // Return the value.
    return value;
}


/**
 * Authenticate a user with the login ID and password contained in the
 * request body.
 */
function authenticateUser(session: Map<string, any>, reqBody: any)
{
    // Extract login credentials from the request.
    const loginId  = reqBody['loginId'] || null;
    const password = reqBody['password'] || null;

    // Look up an end-user who has the login credentials.
    const loginUser = UserDao.getByCredentials(loginId, password);

    if (loginUser)
    {
        // Save the user info in the session.
        session.set('user', loginUser);

        // Save the authentication time in the session.
        session.set('authTime', new Date());
    }
}


/**
 * This method first tried to get user info from the current session.
 * If it was not found in the session, this method tries to look up
 * user info using user credentials contained in the request body.
 */
function authenticateUserIfNecessary(session: Map<string, any>, reqBody: any)
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
 * Check if the client application was authorized by the end-user.
 */
function isClientAuthorized(reqBody: { [key: string]: string })
{
    // If the user pressed "Authorize" button, the request contains an
    // "authorized" parameter.
    return 'authorized' in reqBody;
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
        await this.processForApplicationFormUrlEncoded(async () => {
            // The request body.
            const reqBody = this.getRequestBodyAsObject();

            // The existing session.
            const session = this.getSession();

            // The end-user who authorized or denied the client application's
            // request.
            authenticateUserIfNecessary(session, reqBody);

            // Check if the client application is authorized or not by
            // the end-user.
            const authorized = isClientAuthorized(reqBody);

            // The parameters passed to the handler.
            const params = takeAttribute(session, 'params') as Params;

            if (!params)
            {
                // The key must be present in the session but no such key exists
                // in the session.
                return badRequest("'params' must be present in the session.");
            }

            // Handle the request.
            return await new Handler(this.api, new SpiImpl(session, authorized))
                .handle(params);
        });
    }
}