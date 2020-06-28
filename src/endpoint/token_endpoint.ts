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

import { AuthleteApiFactory, ContentType, TokenRequestHandler } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { TokenRequestHandlerSpiImpl } from '../impl/token_request_handler_spi_impl.ts';
import { BaseEndpoint, Task } from './base_endpoint.ts';
import Params = TokenRequestHandler.Params;


/**
 * An implementation of OAuth 2.0 token endpoint with OpenID Connect support.
 * For more details, see the following links.
 *
 * - [RFC 6749, 3.2. Token Endpoint](http://tools.ietf.org/html/rfc6749#section-3.2)
 *
 * - [OpenID Connect Core 1.0, 3.3.3. Token Endpoint](
 * http://openid.net/specs/openid-connect-core-1_0.html#HybridTokenEndpoint)
 */
export class TokenEndpoint extends BaseEndpoint
{
    /**
     * The token endpoint for `POST` method.
     *
     * [RFC 6749, 3.2. Token Endpoint](http://tools.ietf.org/html/rfc6749#section-3.2)
     * says:
     *
     * > _The client MUST use the HTTP 'POST' method when making
     * access_token requests._
     *
     * [RFC 6749, 2.3. Client Authentication](
     * http://tools.ietf.org/html/rfc6749#section-2.3) mentions (1) HTTP
     * Basic Authentication and (2) `client_id` & `client_secret` parameters
     * in the request body as the means of client authentication. This
     * implementation supports the both means.
     */
    public async post()
    {
        await this.process(<Task>{ execute: async () => {
            // Ensure the content type of the request is 'application/x-www-form-urlencoded'.
            this.ensureContentType(ContentType.APPLICATION_FORM_URLENCODED);

            // Build parameters for TokenRequestHandler.
            const params = this.buildParams();

            // Implementation of TokenRequestHandlerSpi.
            const spi = new TokenRequestHandlerSpiImpl();

            // Authlete API client.
            const api = await AuthleteApiFactory.getDefault();

            // Handle the request.
            return await new TokenRequestHandler(api, spi).handle(params);
        }});
    }


    private buildParams(): Params
    {
        return {
            // RFC 6749
            // The OAuth 2.0 Authorization Framework

            // Set request body info.
            parameters: this.context.reqBody as { [key: string]: string },

            // Set 'Authorization' header info.
            authorization: this.context.request.headers.get('Authorization')
        }
    }
}