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


import { JwksRequestHandler as Handler } from 'https://deno.land/x/authlete_deno/mod.ts';
import { BaseEndpoint } from './base_endpoint.ts';


/**
 * An implementation of an endpoint to expose a JSON Web Key Set document
 * ([RFC 7517](https://tools.ietf.org/html/rfc7517)).
 *
 * An OpenID Provider (OP) is required to expose its JSON Web Key Set
 * document (JWK Set) so that client applications can (1) verify signatures
 * by the OP and (2) encrypt their requests to the OP. The URI of a JWK
 * Set endpoint can be found as the value of `jwks_uri` in [OpenID Provider
 * Metadata](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata)
 * if the OP supports [OpenID Connect Discovery 1.0](
 * https://openid.net/specs/openid-connect-discovery-1_0.html).
 */
export class JwksEndpoint extends BaseEndpoint
{
    /**
     * JWK Set endpoint.
     */
    public async get()
    {
        await this.process(async () => {
            return await new Handler(this.api).handle(true);
        });
    }
}