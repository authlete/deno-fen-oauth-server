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

import { Response } from 'https://deno.land/std/http/server.ts';
import { IContext } from 'https://deno.land/x/fen/server.ts';
import { AuthleteApiFactory, WebApplicationException } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';


/**
 * Interface for a task to be executed in endpoints.
 */
export interface Task
{
    execute(): Promise<Response>
}


/**
 * Append headers in the source headers object to the target headers object.
 */
function appendHeaders(targetHeaders: Headers, sourceHeaders?: Headers)
{
    if (sourceHeaders)
    {
        for (const e of sourceHeaders.entries())
        {
            targetHeaders.append(e[0], e[1]);
        }
    }
}


/**
 * Create a WebApplicationException instance of '400 BadRequest'
 * with the given body content.
 */
export function badRequest(body: string)
{
    const response: Response = {
        status: 400,
        headers: new Headers({ 'Content-Type': 'text/plain;charset=UTF8' }),
        body: body
    };

    return new WebApplicationException(response);
}


/**
 * Base endpoint.
 */
export class BaseEndpoint
{
    /**
     * The context
     */
    protected context: IContext;


    /**
     * The constructor.
     */
    public constructor(context: any)
    {
        this.context = context;
    }


    /**
     * Process a task.
     *
     * @param task - A task to be processed at this endpoint.
     */
    protected async process(task: Task): Promise<void>
    {
        try
        {
            // Execute the task.
            const response = await task.execute();

            // Handle the response info.
            this.handleResponse(response);
        }
        catch (e)
        {
            if (e instanceof WebApplicationException)
            {
                // Set the unexpected error to the body.
                this.handleResponse(e.response);
            }
            else
            {
                // This won't happen.
                throw e;
            }
        }
    }


    private async handleResponse(response: Response)
    {
        // Disable fen's respond.
        this.context.config.disableRespond = true;

        // Merge the headers object created by fen (= this.context.headers)
        // with the headers object obtained by executing the task (=
        // response.headers).
        this.setupResponseHeaders(response);

        // Send the response.
        this.context.request.respond(response);
    }


    private setupResponseHeaders(response: Response)
    {
        // A new header object.
        const newHeaders = new Headers();

        // Append the headers in the context (created by Fen) to the
        // new headers object. The headers object can have a 'set-cookie'
        // header, which is set by Fen's session process.
        appendHeaders(newHeaders, this.context.headers);

        // Append the headers in the response (obtained by executing
        // the task) to the new headers object. The headers object should
        // have some essential headers such as 'content-type', 'cache-control'
        // and etc...
        appendHeaders(newHeaders, response.headers);

        // Set the new headers as the response headers.
        response.headers = newHeaders;
    }


    /**
     * Get the default `AuthleteApi` instance.
     */
    protected async getDefaultApi()
    {
        return await AuthleteApiFactory.getDefault();
    }


    /**
     * Ensure the value of `Content-Type` header in the request is the
     * given `type`.
     */
    protected ensureContentType(type: string)
    {
        // The 'Content-Type' request header.
        const contentType = this.context.request.headers.get('Content-Type');

        if (contentType !== type)
        {
            // Throw a 400 Bad Request Error.
            throw badRequest(`'Content-Type' header must be set to '${type}'.`);
        }
    }
}