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
import { AuthleteApi, badRequest, ContentType, internalServerError } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';


/**
 * Execute a task.
 */
async function executeTask(task: () => Promise<Response>): Promise<Response>
{
    try
    {
        // Execute the task.
        return await task();
    }
    catch (e)
    {
        // Log the error.
        console.log(e);

        // Return a response of '500 Internal Server Error'.
        return internalServerError('Something went wrong.');
    }
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
 * Base endpoint.
 */
export class BaseEndpoint
{
    /**
     * The implementation of `AuthleteApi` interface.
     */
    protected api: AuthleteApi;


    /**
     * The context
     */
    protected context: IContext;


    /**
     * The constructor.
     *
     * @params api
     *          An implementation of `AuthleteApi` interface.
     *
     * @param context
     *         A Fen's context object.
     */
    public constructor(api: AuthleteApi, context: IContext)
    {
        this.api = api;

        this.context = context;
    }


    /**
     * Process a task.
     *
     * @param task
     *         A task to be processed at this endpoint. The task must
     *         return a Promise containing an instance of Deno's standard
     *         `Response` class (defined in https://deno.land/std/http/server.ts).
     */
    protected async process(task: () => Promise<Response>): Promise<void>
    {
        // Execute the task and handle the resultant response.
        this.handleResponse( await executeTask(task) );
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
        this.getRequest().respond(response);
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
     * Get the request body as `{ [key: string]: string }`.
     *
     * This method returns the value returned by
     * `this.context.reqBody as { [key: string]: string }`;
     */
    protected getRequestBodyAsObject()
    {
        return this.context.reqBody as { [key: string]: string };
    }


    /**
     * Get the session associated with the current request.
     *
     * This method returns the value returned by `this.context.data.get('session')`;
     */
    protected getSession()
    {
        return this.context.data.get('session');
    }


    /**
     * Get the current request.
     *
     * This method returns the value returned by `this.context.request`;
     */
    protected getRequest()
    {
        return this.context.request;
    }


    /**
     * Get query parameters from the current request.
     */
    protected getQueryParameters()
    {
        // The proto of the request.
        const proto = this.getRequest().proto.split('/')[0].toLowerCase();

        // The host of the request.
        const host = this.getRequestHeaders().get('host')!;

        // Create a URL instance.
        const url = new URL(`${proto}://${host}${this.getRequest().url}`);

        // The query parameter part of the URL without '?'.
        return url.search.slice(1);
    }


    /**
     * Get the headers of the current request.
     *
     * This method returns the value returned by `this.getRequest().headers`;
     */
    protected getRequestHeaders()
    {
        return this.getRequest().headers;
    }


    /**
     * Get the value of the `Content-Type` request header.
     *
     * This method returns the value returned by `this.getRequestHeaders().get('Content-Type')`;
     */
    protected getRequestContentType()
    {
        return this.getRequestHeaders().get('Content-Type');
    }


    /**
     * Get the value of the `Authorization` request header.
     *
     * This method returns the value returned by `this.getRequestHeaders().get('Authorization')`;
     */
    protected getAuthorization()
    {
        return this.getRequestHeaders().get('Authorization');
    }


    /**
     * Execute a task after ensuring that the value of the `Content-Type`
     * request header is `application/x-www-form-urlencoded`.
     *
     * If the content type is wrong, a response of `'400 BadRequest'`
     * is returned to the end-user.
     */
    protected async processForApplicationFormUrlEncoded(task: () => Promise<Response>)
    {
        await this.processForContentType(ContentType.APPLICATION_FORM_URLENCODED, task);
    }


    /**
     * Execute a task after ensuring that the content type of the request
     * is the target one.
     *
     * If the content type is wrong, a response of `'400 BadRequest'`
     * is returned to the end-user.
     */
    private async processForContentType(type: string, task: () => Promise<Response>)
    {
        await this.process(async () => {
            // Check the request content type.
            if (this.getRequestContentType() !== type)
            {
                return badRequest(`Request 'Content-Type' must be '${type}'.`);
            }

            // Then, execute the task.
            return await task();
        });
    }
}