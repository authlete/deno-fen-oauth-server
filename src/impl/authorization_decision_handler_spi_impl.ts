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


import { AuthorizationDecisionHandlerSpi } from 'https://deno.land/x/authlete_deno/mod.ts';
import { AuthorizationRequestHandlerSpiImpl } from './authorization_request_handler_spi_impl.ts';


/**
 * Implementation of `AuthorizationDecisionHandlerSpi` interface.
 *
 * This is supposed to be given to the constructor of `AuthorizationDecisionHandler`.
 */
export class AuthorizationDecisionHandlerSpiImpl
    extends AuthorizationRequestHandlerSpiImpl implements AuthorizationDecisionHandlerSpi
{
    private clientAuthorized: boolean;


    /**
     * The constructor.
     *
     * @param session
     *         The session associated with a request.
     *
     * @param clientAuthorized
     *         The flag to indicate whether the client application is
     *         authorized or not by the end-user.
     */
    constructor(session: Map<string, any>, clientAuthorized: boolean)
    {
        super(session);

        this.clientAuthorized = clientAuthorized;
    }


    public isClientAuthorized(): boolean
    {
        // True if the end-user has authorized the authorization request.
        return this.clientAuthorized;
    }
}