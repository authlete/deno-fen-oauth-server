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


import { TokenRequestHandlerSpiAdapter } from 'https://deno.land/x/authlete_deno@v1.2.0/mod.ts';
import { UserDao } from '../db/user_dao.ts';


/**
 * Implementation of `TokenRequestHandlerSpi` interface.
 *
 * This is supposed to be given to the constructor of `TokenHandler`.
 */
export class TokenRequestHandlerSpiImpl extends TokenRequestHandlerSpiAdapter
{
    public authenticateUser(
        username: string | null, password: string | null): string | null
    {
        // Note: this method needs to be implemented only when you want
        // to support 'Resource Owner Password Credentials Grant' flow
        // (RFC 6749, 4.3).

        // Search the user database for a user.
        const user = UserDao.getByCredentials(username, password);

        // If the user was found, return the subject of the user.
        return user ? user.subject : null;
    }
}