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


import { IContext } from 'https://deno.land/x/fen@v0.8.0/server.ts';


/**
 * The function for custom process.
 */
export async function authleteProcess(context: IContext): Promise<IContext>
{
    // Currently, fen always creates a session and sets the session ID
    // to the 'set-cookie' response header for any request that has been
    // sent without a session ID (even if it is a request to get favicon)
    // when the server is configured to use session.
    // However, we only want to set session IDs when the authorization
    // endpoint (/api/authorization) is accessed. The only workaround to
    // achieve this would be to remove a session ID from response headers
    // if the request was not sent to the authorization endpoint.
    // (NOTE: This can't prevent fens from generating sessions when requests
    // without session ID are sent to endpoints other than the authorization
    // endpoint.)
    if (context.path !== '/api/authorization')
    {
        context.headers.delete('set-cookie');
    }

    return context;
}