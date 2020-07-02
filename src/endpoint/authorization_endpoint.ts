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

import { ServerRequest } from 'https://deno.land/std/http/server.ts';
import { AuthorizationRequestHandler as Handler, ContentType } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { AuthorizationRequestHandlerSpiImpl as SpiImpl } from '../impl/authorization_request_handler_spi_impl.ts';
import { BaseEndpoint, Task } from './base_endpoint.ts';


/**
 * Extract query parameters from the request.
 */
function extractQueryParameters(request: ServerRequest): string | null
{
    // The proto of the request.
    const proto = request.proto.split('/')[0].toLowerCase();

    // The host of the request.
    const host = request.headers.get('host')!;

    // Create a URL instance.
    const url = new URL(`${proto}://${host}${request.url}`);

    // The query parameter part of the URL without '?'.
    return url.search.slice(1);
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
        await this.process(<Task>{ execute: async () => {
            // Handle the request.
            return await this.handle(extractQueryParameters(this.context.request));
        }});
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
        await this.process(<Task>{ execute: async () => {
            // Ensure the content type of the request is 'application/x-www-form-urlencoded'.
            this.ensureContentType(ContentType.APPLICATION_FORM_URLENCODED);

            // Handle the request.
            return await this.handle( this.context.reqBody as { [key: string]: string } );
        }});
    }


    private async handle(parameters: Handler.parametersType)
    {
        // Create a handler instance and process the parameters with it.
        return await new Handler(await this.getDefaultApi(), new SpiImpl(this.context))
            .handle(parameters);
    }
}