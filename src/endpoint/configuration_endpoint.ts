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

import { ConfigurationRequestHandler as Handler } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { BaseEndpoint, Task } from './base_endpoint.ts';


/**
 * An implementation of an OpenID Provider configuration endpoint.
 *
 * An OpenID Provider that supports [OpenID Connect Discovery 1.0](
 * http://openid.net/specs/openid-connect-discovery-1_0.html) must provide
 * an endpoint that returns its configuration information in a JSON format.
 * Details about the format are described in "[3. OpenID Provider Metadata](
 * http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata)"
 * in OpenID Connect Discovery 1.0.
 *
 * Note that the URI of an OpenID Provider configuration endpoint is
 * defined in "[4.1. OpenID Provider Configuration Request](
 * http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfigurationRequest
 * )" in OpenID Connect Discovery 1.0. In short, the URI must be:
 *
 * > Issuer Identifier + `/.well-known/openid-configuration`
 *
 * _Issuer Identifier_ is a URL to identify an OpenID Provider. For
 * example, `https://example.com`. For details about Issuer Identifier,
 * See `issuer` in "[3. OpenID Provider Metadata](
 * http://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata)"
 * (OpenID Connect Discovery 1.0) and `iss` in "[2. ID Token](
 * http://openid.net/specs/openid-connect-core-1_0.html#IDToken)" (OpenID
 * Connect Core 1.0).
 *
 * You can change the Issuer Identifier of your service using the management
 * console ([Service Owner Console](https://www.authlete.com/documents/so_console)).
 * Note that the default value of Issuer Identifier is not appropriate
 * for commercial use, so you should change it.
 */
export class ConfigurationEndpoint extends BaseEndpoint
{
    /**
     * OpenID Provider configuration endpoint.
     */
    public async get()
    {
        await this.process(<Task>{ execute: async () => {
            // Handle the request.
            return await new Handler(await this.getDefaultApi()).handle(true);
        }});
    }
}