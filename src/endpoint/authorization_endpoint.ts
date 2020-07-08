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


import {
    AuthorizationDecisionHandler, AuthorizationPageModel, AuthorizationRequest, AuthorizationRequestErrorHandler,
    AuthorizationResponse, isEmpty, isUndefined, NoInteractionHandler, normalizeParameters, okHtml, Prompt, User
} from 'https://deno.land/x/authlete_deno/mod.ts';
import { renderFileToString } from 'https://deno.land/x/dejs@0.7.0/mod.ts';
import { NoInteractionHandlerSpiImpl } from '../impl/no_interaction_handler_spi_impl.ts';
import { BaseEndpoint } from './base_endpoint.ts';
import Action = AuthorizationResponse.Action;
import Params = AuthorizationDecisionHandler.Params;


/**
 * The type of 'parameters' parameter passed to the `handle` method
 * in `AuthorizationRequestHandler`.
 */
export type parametersType = string | { [key: string]: string } | null;


function clearUserDataIfNecessary(info: AuthorizationResponse, session: Map<string, any>)
{
    // Get the user info from the session.
    const user     = session.get('user');
    const authTime = session.get('authTime');

    // No check is needed if the user info does not exist in the session.
    if (isUndefined(user) || isUndefined(authTime)) return;

    // Check 'prompts'.
    checkPrompts(info, session);

    // Check 'authentication age'.
    checkAuthenticationAge(info, session, authTime);
}


function checkPrompts(info: AuthorizationResponse, session: Map<string, any>)
{
    // If no prompt is requested.
    if (isEmpty(info.prompts)) return;

    // If 'login' prompt is requested.
    if (info.prompts!.includes(Prompt.LOGIN))
    {
        // Force a login by clearing out the current user.
        clearUserData(session);
    }
}


function checkAuthenticationAge(
    info: AuthorizationResponse, session: Map<string, any>, authTime: Date)
{
    // No check is needed if the maximum authentication age is not a
    // positive number.
    if (info.maxAge <= 0) return;

    // Calculate number of seconds that have elapsed since login.
    const now     = new Date();
    const authAge = Math.round( (now.getTime() - authTime.getTime()) / 1000 );

    if (authAge > info.maxAge)
    {
        // Session age is too old, clear out the current user data.
        clearUserData(session);
    }
}


function clearUserData(session: Map<string, any>)
{
    session.delete('user');
    session.delete('authTime');
}


/**
 * The ejs file for the authorization page.
 */
const AUTHORIZATION_PAGE = './rsc/ejs/authorization.ejs';


async function renderAuthorizationPage(info: AuthorizationResponse, user: User)
{
    // The model for rendering the authorization page.
    const model = new AuthorizationPageModel(info, user);

    // Render the authorization page as string.
    return await renderFileToString(AUTHORIZATION_PAGE, { model: model })
}


/**
 * An implementation of OAuth 2.0 authorization endpoint with OpenID
 * Connect support. For more details, see the following links.
 *
 * - [RFC 6749, 3.1. Authorization Endpoint](
 * http://tools.ietf.org/html/rfc6749#section-3.1)
 *
 * - [OpenID Connect Core 1.0, 3.1.2. Authorization Endpoint (Authorization
 * Code Flow)](http://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint)
 *
 * - [OpenID Connect Core 1.0, 3.2.2. Authorization Endpoint (Implicit
 * Flow)](http://openid.net/specs/openid-connect-core-1_0.html#ImplicitAuthorizationEndpoint)
 *
 * - [OpenID Connect Core 1.0, 3.3.2. Authorization Endpoint (Hybrid
 * Flow)](http://openid.net/specs/openid-connect-core-1_0.html#HybridAuthorizationEndpoint)
 */
export class AuthorizationEndpoint extends BaseEndpoint
{
    /**
     * The authorization endpoint for `GET` method.
     *
     * [RFC6749 3.1 Authorization Endpoint](
     * http://tools.ietf.org/html/rfc6749#section-3.1) says that the
     * authorization endpoint MUST support `GET` method.
     */
    public async get()
    {
        await this.process(async () => {
            return await this.handle(this.getQueryParameters());
        });
    }


    /**
     * The authorization endpoint for `POST` method.
     *
     * [RFC6749 3.1 Authorization Endpoint](
     * http://tools.ietf.org/html/rfc6749#section-3.1) says that the
     * authorization endpoint MAY support `POST` method.
     *
     * In addition, [OpenID Connect Core 1.0, 3.1.2.1. Authentication
     * Request](http://openid.net/specs/openid-connect-core-1_0.html#AuthRequest)}
     * says that the authorization endpoint MUST support `POST` method.
     */
    public async post()
    {
        await this.processForApplicationFormUrlEncoded(async () => {
            return await this.handle(this.getRequestBodyAsObject());
        });
    }


    private async handle(parameters: parametersType)
    {
        // Call Authlete /api/auth/authorization API.
        const response = await this.callAuthorization(parameters);

        // Dispatch according to the action.
        switch (response.action)
        {
            case Action.INTERACTION:
                // Process the authorization request with user interaction.
                return await this.handleInteraction(response);

            case Action.NO_INTERACTION:
                // Process the authorization request without user interaction.
                // The flow reaches here only when the authorization request
                // contained prompt=none.
                return await this.handleNoInteraction(response);

            default:
                // Handle other error cases here.
                return await this.handleError(response);
        }
    }


    /**
     * Call Authlete `/api/auth/authorization` API.
     */
    private async callAuthorization(parameters: parametersType)
    {
        // Create a request for Authlete /api/auth/authorization API.
        const request = new AuthorizationRequest();

        // Normalize parameters.
        request.parameters = normalizeParameters(parameters);

        // Call Authlete /api/auth/authorization API.
        return await this.api.authorization(request);
    }


    /**
     * Handle the case where `action` parameter in a response from
     * Authlete `/api/auth/authorization` API is `INTERACTION`.
     */
    private async handleInteraction(info: AuthorizationResponse)
    {
        // Set parameters to the session for later use.
        const session = this.getSession();
        session.set('params', Params.from(info));
        session.set('acrs',   info.acrs);
        session.set('client', info.client);

        // Clear the current user info in the session if needed.
        clearUserDataIfNecessary(info, session);

        // Render the authorization page.
        const authorizationPage =
            await renderAuthorizationPage(info, session.get('user') as User);

        // Return a response of '200 OK' with the authorization page.
        return okHtml(authorizationPage);
    }


    /**
     * Handle the case where `action` parameter in a response from
     * Authlete `/api/auth/authorization` API is `NO_INTERACTION`.
     */
    private async handleNoInteraction(response: AuthorizationResponse)
    {
        return await new NoInteractionHandler(
            this.api, new NoInteractionHandlerSpiImpl(this.getSession())
        ).handle(response);
    }


    /**
     * Handle cases where `action` parameter in a response from Authlete
     * `/api/auth/authorization` API is other than `INTERACTION` or
     * `NO_INTERACTION`.
     */
    private async handleError(response: AuthorizationResponse)
    {
        // Make AuthorizationRequestErrorHandler handle the
        // error case.
        return await new AuthorizationRequestErrorHandler()
            .handle(response);
    }
}