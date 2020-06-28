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

import { AuthorizationDecisionHandlerSpiAdapter, isEmpty, isObject, parseJson, Property, User } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';


/**
 * Check if the given object conforms to the format of a claim in the
 * 'id_token' property in the 'claims' request parameter.
 */
function isIdTokenClaim(obj: any)
{
    // The expected format of a claim in the 'id_token' property is
    // as follows. See '5.5. Requesting Claims using the 'claims'
    // Request Parameter' in OpenID Connect Core 1.0 for details.
    //
    //   "claim_name" : {
    //       "essential": <boolean>,   // Optional
    //       "value":     <value>,     // Optional
    //       "values":    [<values>]   // Optional
    //   }
    //
    return isObject(obj) &&
        [ 'essential', 'value', 'values' ].some(p => p in obj);
}


/**
 * Implementation of `AuthorizationDecisionHandlerSpi` interface.
 *
 * This is supposed to be given to the constructor of `AuthorizationDecisionHandler`.
 */
export class AuthorizationDecisionHandlerSpiImpl extends AuthorizationDecisionHandlerSpiAdapter
{
    private clientAuthorized: boolean;
    private user: User | null = null;
    private userAuthenticatedAt: number = 0;
    private userSubject: string | null = null;
    private idTokenClaims: { [key: string]: any } | null = null;
    private acrs: string[] | null = null;


    /**
     * The constructor.
     *
     * @param parameters - The request parameters.
     *
     * @param user - The end-user who authorized/denied the client
     *               application's request.
     *
     * @param userAuthenticatedAt - The time when the end-user was
     *                              authenticated.
     *
     * @param idTokenClaims - The requested ID token claims (JSON format).
     *
     * @param acrs - The requested ACRs.
     */
    constructor(
        parameters: { [key: string]: string }, user: User | null, userAuthenticatedAt: Date | null,
        idTokenClaims: string | null, acrs: string[] | null)
    {
        super();

        // If the end-user clicked the 'Authorize' button, 'authorized'
        // is contained in the request.
        this.clientAuthorized = 'authorized' in parameters;

        // If the end-user denied the authorization request.
        if (!this.clientAuthorized) return;

        // Look up an end-user who has the login credentials.
        this.user = user;

        // If nobody has the login credentials.
        if (!this.user) return;

        // The authentication time is calculated externally and passed
        // in.
        if (!userAuthenticatedAt) return;

        // TODO: This should be passing in seconds to the API but we
        // currently need to pass in milliseconds to get the correct
        // behavior.
        this.userAuthenticatedAt = Math.round( userAuthenticatedAt.getTime() / 1000 );

        // The subject (= unique identifier) of the end-user.
        this.userSubject = this.user.subject!;

        // The value of the 'id_token' property in the 'claims' request
        // parameter (or in the 'claims' property in the request object)
        // contained in the original authorization request. See "5.5.
        // Requesting Claims using the 'claims' Request Parameter" in
        // OpenID Connect Core 1.0 for details.
        this.idTokenClaims = parseJson(idTokenClaims);

        // The requested ACRs.
        this.acrs = acrs;
    }


    public isClientAuthorized(): boolean
    {
        // True if the end-user has authorized the authorization request.
        return this.clientAuthorized;
    }


    public getUserAuthenticatedAt(): number
    {
        // The time when the end-user was authenticated in seconds
        // since Unix epoch (1970-01-01).
        return this.userAuthenticatedAt;
    }


    public getUserSubject(): string | null
    {
        // The subject (= unique identifier) of the end-user.
        return this.userSubject;
    }


    public getProperties(): Property[] | null
    {
        // Properties returned from this method will be associated with
        // an access token (in the case of 'Implicit flow') and/or an
        // authorization code (in the case of 'Authorization Code' flow)
        // that may be issued as a result of the authorization request.
        return null;
    }


    public getAcr(): string | null
    {
        // Note that this is a dummy implementation. Regardless of whatever
        // the actual authentication was, this implementation returns the
        // first element of the requested ACRs if it is available.
        //
        // Of course, this implementation is not suitable for commercial
        // use.

        if (isEmpty(this.acrs)) return null;

        // The first element of the requested ACRs.
        const acr = this.acrs![0];

        if (isEmpty(acr)) return null;

        // Return the first element of the requested ACRs. Again, this
        // implementation is not suitable for commercial use.
        return acr;
    }


    public getUserClaim(claimName: string, languageTag?: string): any
    {
        // First, check if the claim is a custom one.
        const value = this.getCustomClaim(claimName, languageTag);

        // If the value for the custom claim was obtained.
        if (value) return value;

        // getUserClaim() is called only when getUserSubject() has returned
        // a non-null value. So, mUser is not null when the flow reaches
        // here.
        return this.user!.getClaim(claimName, languageTag);
    }


    private getCustomClaim(claimName: string, languageTag?: string): any
    {
        // Special behavior for Open Banking Profile.
        if (claimName === 'openbanking_intent_id')
        {
            // The Open Banking Profile requires that an authorization
            // request contains the 'openbanking_intent_id' claim and
            // the authorization server embeds the value of the claim
            // in an ID token.
            return this.getValueFromIdTokenClaims(claimName);
        }

        return null;
    }


    private getValueFromIdTokenClaims(claimName: string): any
    {
        // Try to extract the entry for the claim from the 'id_token'
        // property in the 'claims' (which was contained in the original
        // authorization request).
        const entry: { [key: string]: any } | null = this.getEntryFromIdTokenClaims(claimName);

        // This method expects that the entry has a 'value' property.
        return entry ? entry['value'] : null;
    }


    private getEntryFromIdTokenClaims(claimName: string): { [key: string]: any } | null
    {
        // If the original authorization request does not include the
        // 'id_token' property in the 'claims' request parameter (or in
        // the 'claims' property in the request object).
        if (!this.idTokenClaims) return null;

        // Extract the entry for the claim from the 'id_token' property.
        const entry = this.idTokenClaims[claimName];

        if (isIdTokenClaim(entry))
        {
            // Found the entry for the claim.
            return entry as { [key: string ]: any };
        }

        // The format of the claim is invalid.
        return null;
    }
}