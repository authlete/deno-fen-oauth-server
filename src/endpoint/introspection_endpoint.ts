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


import { BasicCredentials, IntrospectionRequestHandler as Handler, unauthorized } from 'https://deno.land/x/authlete_deno/mod.ts';
import { BaseEndpoint } from './base_endpoint.ts';


/**
 * The value for `WWW-Authenticate` header on `'401 Unauthorized'`.
 */
const CHALLENGE = 'Basic realm="/api/introspection"';


/**
 * An implementation of introspection endpoint ([RFC 7662](
 * https://tools.ietf.org/html/rfc7662)).
 */
export class IntrospectionEndpoint extends BaseEndpoint
{
    /**
     * The introspection endpoint.
     *
     * For more details, see [RFC 7662, 2.1. Introspection Request](
     * https://tools.ietf.org/html/rfc7662#section-2.1).
     */
    public async post()
    {
        await this.processForApplicationFormUrlEncoded(async () => {
            // "2.1. Introspection Request" in RFC 7662 says as follows:
            //
            //   To prevent token scanning attacks, the endpoint MUST also require
            //   some form of authorization to access this endpoint, such as client
            //   authentication as described in OAuth 2.0 [RFC6749] or a separate
            //   OAuth 2.0 access token such as the bearer token described in OAuth
            //   2.0 Bearer Token Usage [RFC6750].  The methods of managing and
            //   validating these authentication credentials are out of scope of this
            //   specification.
            //
            // Therefore, this API must be protected in some way or other.
            // Basic Authentication and Bearer Token are typical means, and
            // both use the value of the 'Authorization' header.

            // Return a response of "401 Unauthorized" if the API caller
            // does not have necessary privileges to call this API.
            if (!this.authenticateApiCaller()) return unauthorized(CHALLENGE);

            // Handle the request.
            return await new Handler(this.api)
                .handle(this.getRequestBodyAsObject());
        });
    }


    private authenticateApiCaller()
    {
        // TODO: This implementation is for demonstration purpose only.

        // Parse the value of the 'Authorization' request header as
        // credentials.
        const credentials = BasicCredentials.parse(this.getAuthorization());

        // In this implementation, a user is authenticated when the user
        // ID exists and the value is not 'nobody'.
        return credentials &&
               credentials.userId &&
               credentials.userId !== 'nobody';
    }
}