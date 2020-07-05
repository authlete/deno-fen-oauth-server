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


import { Address } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { UserEntity } from './user_entity.ts';


/**
 * Create a `UserEntity` object.
 */
function createUserEntity(
    subject: string, loginId: string, password: string, name: string,
    email: string, country: string, phoneNumber: string): UserEntity
{
    const ue = new UserEntity();

    ue.subject         = subject;
    ue.loginId         = loginId;
    ue.password        = password;
    ue.name            = name;
    ue.email           = email;
    ue.phoneNumber     = phoneNumber;
    ue.address         = new Address();
    ue.address.country = country;
    ue.phoneNumber     = phoneNumber;

    return ue;
}


/**
 * Dummy user database.
 */
const users: UserEntity[] = [
    createUserEntity(
        '1001', 'john', 'john', 'John Flibble Smith',
        'john@example.com', 'USA Flibble', '+1 (425) 555-1212'
    ),

    createUserEntity(
        '1002', 'jane', 'jane', 'Jane Smith',
        'jane@example.com', 'Chile', '+56 (2) 687 2400'
    ),

    createUserEntity(
        '1003', 'max', 'max', 'Max Meier',
        'max@example.com', 'Germany', '+49 (30) 210 94-0'
    )
];


/**
 * Condition for user search.
 */
interface SearchCondition
{
    check(ue: UserEntity): boolean;
}


/**
 * Base function to find a user.
 */
function get(condition: SearchCondition): UserEntity | null
{
    for (const ue of users)
    {
        if (condition.check(ue))
        {
            // User found.
            return ue;
        }
    }

    // User not found.
    return null;
}


/**
 * Data Access Object for user information.
 */
export class UserDao
{
    /**
     * Search a user with the given login ID and password.
     *
     * @param loginId
     *         The login ID of a user.
     *
     * @param password
     *         The password of a user.
     *
     * @returns A `UserEntity` object representing a user who has the given
     *          credentials or `null` if no user has the credentials.
     */
    public static getByCredentials(
        loginId: string | null, password: string | null): UserEntity | null
    {
        return get(<SearchCondition> {
            check(ue: UserEntity)
            {
                return ue.loginId === loginId && ue.password === password;
            }
        });
    }
}