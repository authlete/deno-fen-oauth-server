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

import { Response } from 'https://deno.land/std/http/server.ts';
import { renderFileToString } from 'https://deno.land/x/dejs@0.7.0/mod.ts';
import { IContext } from 'https://deno.land/x/fen/server.ts';
import { AuthorizationDecisionHandler, AuthorizationPageModel, AuthorizationRequestHandlerSpiAdapter, AuthorizationResponse, isEmpty, Prompt, User } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import Params = AuthorizationDecisionHandler.Params;


/**
 * The ejs file for the authorization page.
 */
const AUTHORIZATION_PAGE = './rsc/ejs/authorization.ejs';


function clearCurrentUserInfoInSessionIfNecessary(info: AuthorizationResponse, session: Map<string, any>)
{
    // Get the user info from the session if present.
    const user     = session.get('user');
    const authTime = session.get('authTime');

    if (user && authTime)
    {
        // Check 'prompts'.
        checkPrompts(info, session);

        // Check 'authentication age'.
        checkAuthenticationAge(info, session, authTime);
    }
}


function checkPrompts(info: AuthorizationResponse, session: Map<string, any>)
{
    // If no prompt is requested.
    if (isEmpty(info.prompts)) return;

    // If 'login' prompt is requested.
    if (info.prompts!.includes(Prompt.LOGIN))
    {
        // Force a login by clearing out the current user.
        clearCurrentUserInfoInSession(session);
    }
}


function checkAuthenticationAge(
    info: AuthorizationResponse, session: Map<string, any>, authTime: Date)
{
    // TODO: 'info.maxAge' is always a number (it can't be 'undefined').
    const maxAge = info.maxAge!;

    // TODO: max_age == 0 effectively means "log in the user interactively
    // now" but it's used here as a flag, we should fix this to use Integer
    // instead of int probably.
    if (maxAge <= 0) return;

    // Calculate number of seconds that have elapsed since login.
    const now = new Date();
    const authAge = Math.round( (now.getTime() - authTime.getTime()) / 1000 );

    if (authAge > maxAge)
    {
        // Session age is too old, clear out the current user.
        clearCurrentUserInfoInSession(session);
    }
}


function clearCurrentUserInfoInSession(session: Map<string, any>)
{
    session.delete('user');
    session.delete('authTime');
}


/**
 * Implementation of `AuthorizationHandlerSpi` interface.
 *
 * This is supposed to be given to the constructor of `AuthorizationHandler`.
 */
export class AuthorizationRequestHandlerSpiImpl extends AuthorizationRequestHandlerSpiAdapter
{
    /**
     * The context.
     */
    private context: IContext;


    /**
     * The constructor
     *
     * @param context - The context.
     */
    public constructor(context: IContext)
    {
        super();

        this.context = context;
    }


    public isUserAuthenticated(): boolean
    {
        return this.context.data.get('session').has('user');
    }


    public getUserAuthenticatedAt(): number
    {
        // Get the authentication time from the session.
        const authTime = this.context.data.get('session').get('authTime');

        return authTime ? Math.round( authTime.getTime() / 1000 ) : 0;
    }


    public getUserSubject(): string | null
    {
        // Get the authenticated user from the session.
        const user = this.context.data.get('session').get('user');

        return user ? user.subject : null;
    }


    public async generateAuthorizationPage(info: AuthorizationResponse): Promise<Response>
    {
        // The current session.
        const session = this.context.data.get('session');

        // Set parameters to the session for later use.
        session.set('params', Params.from(info));
        session.set('acrs', info.acrs);
        session.set('client', info.client);

        // Clear the current user info in the session if needed.
        clearCurrentUserInfoInSessionIfNecessary(info, session);

        // Prepare a model object for building the authorization page.
        const user  = session.get('user') as User;
        const model = new AuthorizationPageModel(info, user);

        // Create a '200 OK' response having the authorization page.
        return {
            status: 200,
            headers: new Headers({ 'Content-Type': 'text/html' }),
            body: await renderFileToString(AUTHORIZATION_PAGE, { model: model })
        };
    }
}