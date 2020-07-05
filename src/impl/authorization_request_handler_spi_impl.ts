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


import { AuthorizationRequestHandlerSpiAdapter } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { UserEntity } from '../db/user_entity.ts';


/**
 * Implementation of `AuthorizationDecisionHandlerSpi` interface.
 */
export class AuthorizationRequestHandlerSpiImpl extends AuthorizationRequestHandlerSpiAdapter
{
    private session: Map<string, any>;


    constructor(session: Map<string, any>)
    {
        super();

        this.session = session;
    }


    public getUserClaimValue(subject: string, claimName: string, languageTag?: string): any
    {
        // Return null if 'user' doesn't exist in the session.
        if (!this.session.has('user')) return null;

        // Get the user entity from the session.
        const user = this.session.get('user') as UserEntity;

        // Return the claim value.
        return user.getClaim(claimName, languageTag);
    }


    public getUserAuthenticatedAt(): number
    {
        // Return 0 if 'user' and 'authTime' don't exist in the session.
        if (!this.session.has('user') || !this.session.has('authTime'))
        {
            return 0;
        }

        // Get the authentication time from the session.
        const authTime = this.session.get('authTime') as Date;

        // Return the authentication time in seconds.
        return Math.round( authTime.getTime() / 1000 );
    }


    public getUserSubject(): string | null
    {
        // Return null if 'user' doesn't exist in the session.
        if (!this.session.has('user')) return null;

        // Get the user entity from the session.
        const user = this.session.get('user') as UserEntity;

        // The subject (= unique identifier) of the end-user.
        return user.subject;
    }
}