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

import { ContentType, RevocationRequestHandler as Handler } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { BaseEndpoint, Task } from './base_endpoint.ts';
import Params = Handler.Params;


/**
 * An implementation of revocation endpoint ([RFC 7009](
 * https://tools.ietf.org/html/rfc7009)).
 */
export class RevocationEndpoint extends BaseEndpoint
{
    /**
     * The revocation endpoint for `POST` method.
     *
     * See also "[RFC 7009, 2.1. Revocation Request](
     * http://tools.ietf.org/html/rfc7009#section-2.1)".
     */
    public async post()
    {
        await this.process(<Task>{ execute: async () => {
            // Ensure the content type of the request is 'application/x-www-form-urlencoded'.
            this.ensureContentType(ContentType.APPLICATION_FORM_URLENCODED);

            // Handle the request.
            return await new Handler(await this.getDefaultApi()).handle(this.buildParams());
        }});
    }


    private buildParams(): Params
    {
        return {
            // Set request body info.
            parameters: this.context.reqBody as { [key: string]: string },

            // Set 'Authorization' header info.
            authorization: this.context.request.headers.get('Authorization')
        }
    }
}