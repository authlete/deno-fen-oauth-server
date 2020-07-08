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


import { RevocationRequestHandler as Handler } from 'https://deno.land/x/authlete_deno/mod.ts';
import { BaseEndpoint } from './base_endpoint.ts';
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
        await this.processForApplicationFormUrlEncoded(async () => {
            return await new Handler(this.api)
                .handle(this.buildParams());
        });
    }


    private buildParams(): Params
    {
        return {
            // Set request body info.
            parameters: this.getRequestBodyAsObject(),

            // Set 'Authorization' header info.
            authorization: this.getAuthorization()
        }
    }
}