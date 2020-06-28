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

import { Address, isEmpty, StandardClaims, User } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';


/**
 * An implementation of `User` interface.
 */
export class UserEntity implements User
{
    public subject!: string;
    public loginId?: string;
    public password?: string;
    public name?: string;
    public email?: string;
    public address?: Address;
    public phoneNumber?: string;


    public getClaim(claimName: string, languageTag?: string): any
    {
        if (isEmpty(claimName))
        {
            return null;
        }

        switch(claimName)
        {
            case StandardClaims.NAME:
                // 'name' claim. This claim can be requested by including
                // 'profile' in 'scope' parameter of an authorization
                // request.
                return this.name;

            case StandardClaims.EMAIL:
                // 'email' claim. This claim can be requested by including
                // 'email' in 'scope' parameter of an authorization request.
                return this.email;

            case StandardClaims.ADDRESS:
                // 'address' claim. This claim can be requested by including
                // 'address' in 'scope' parameter of an authorization
                // request.
                return this.address;

            case StandardClaims.PHONE_NUMBER:
                // 'phone_number' claim. This claim can be requested by
                // including 'phone' in 'scope' parameter of an authorization
                // request.
                return this.phoneNumber;

            default:
                // Unsupported claim.
                return null;
        }
    }


    public getAttribute(attributeName: string): any
    {
        // This implementation always returns null as an attribute.
        return null;
    }
}