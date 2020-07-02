Authorization Server Implementation for Deno
=============================================

Overview
--------

This is an authorization server implementation for Deno that supports
[OAuth 2.0][RFC6749] and [OpenID Connect][OIDC].

This implementation is written using [Fen][Fen] framework and
[authlete-deno-library][AuthleteDeno].

License
-------

  Apache License, Version 2.0

Source Code
-----------

  <code>https://github.com/authlete/deno-fen-oauth-server</code>

About Authlete
--------------

[Authlete][Authlete] is a cloud service that provides an implementation of
OAuth 2.0 & OpenID Connect ([overview][AuthleteOverview]). You can easily get
the functionalities of OAuth 2.0 and OpenID Connect either by using the default
implementation provided by Authlete or by implementing your own authorization
server using [Authlete Web APIs][AuthleteAPI] as this implementation
(deno-fen-oauth-server) does.

To use this authorization server implementation, you need to get API credentials
from Authlete and set them in `authlete.json`. The steps to get API credentials
are very easy. All you have to do is just to register your account
([sign up][AuthleteSignUp]). See [Getting Started][AuthleteGettingStarted]
for details.

How To Run
----------

1. Download the code.

        $ git clone https://github.com/authlete/deno-fen-oauth-server.git
        $ cd deno-fen-oauth-server

2. Edit the configuration file to set the API credentials of yours.

        $ vi authlete.json

3. Start the authorization server on `http://localhost:1902`.

        $ deno run --allow-net --allow-read --config tsconfig.json src/server.ts

Endpoints
---------

This implementation exposes endpoints as listed in the table below.

| Endpoint                             | Path                                |
|:-------------------------------------|:------------------------------------|
| Authorization Endpoint               | `/api/authorization`                |
| Token Endpoint                       | `/api/token`                        |
| JWK Set Endpoint                     | `/api/jwks`                         |
| Configuration Endpoint               | `/.well-known/openid-configuration` |
| Revocation Endpoint                  | `/api/revocation`                   |
| Introspection Endpoint               | `/api/introspection`                |

The authorization endpoint and the token endpoint accept parameters described
in [RFC 6749][RFC6749], [OpenID Connect Core 1.0][OIDCCore],
[OAuth 2.0 Multiple Response Type Encoding Practices][MultiResponseType],
[RFC 7636][RFC7636] ([PKCE][PKCE]) and other specifications.

The JWK Set endpoint exposes a JSON Web Key Set document (JWK Set) so that
client applications can (1) verify signatures signed by this OpenID Provider
and (2) encrypt their requests to this OpenID Provider.

The configuration endpoint exposes the configuration information of this OpenID
Provider in the JSON format defined in [OpenID Connect Discovery 1.0][OIDCDiscovery].

The revocation endpoint is a Web API to revoke access tokens and refresh
tokens. Its behavior is defined in [RFC 7009][RFC7009].

The introspection endpoint is a Web API to get information about access
tokens and refresh tokens. Its behavior is defined in [RFC 7662][RFC7662].

Authorization Request Example
-----------------------------

The following is an example to get an access token from the authorization
endpoint using [Implicit Flow][ImplicitFlow]. Don't forget to replace
`{client-id}` in the URL with the real client ID of one of your client
applications. As for client applications, see
[Getting Started][AuthleteGettingStarted] and the document of
[Developer Console][DeveloperConsole].

    http://localhost:1902/api/authorization?client_id={client-id}&response_type=token

The request above will show you an authorization page. The page asks you
to input login credentials and click "Authorize" button or "Deny" button.
Use one of the following as login credentials (`src/db/user_dao.ts`).

| Login ID | Password |
|:--------:|:--------:|
|   john   |   john   |
|   jane   |   jane   |
|   max    |   max    |

See Also
--------

- [Authlete][Authlete] - Authlete Home Page
- [authlete-deno][AuthleteDeno] - Authlete Library for Deno

Contact
-------

Contact Form : https://www.authlete.com/contact/

| Purpose   | Email Address        |
|:----------|:---------------------|
| General   | info@authlete.com    |
| Sales     | sales@authlete.com   |
| PR        | pr@authlete.com      |
| Technical | support@authlete.com |

[Authlete]:               https://www.authlete.com/
[AuthleteAPI]:            https://docs.authlete.com/
[AuthleteGettingStarted]: https://www.authlete.com/developers/getting_started/
[AuthleteOverview]:       https://www.authlete.com/developers/overview/
[AuthleteDeno]:           https://github.com/authlete/authlete-deno
[AuthleteSignUp]:         https://so.authlete.com/accounts/signup
[DeveloperConsole]:       https://www.authlete.com/developers/cd_console/
[Fen]:                    https://github.com/fen-land/deno-fen
[ImplicitFlow]:           https://tools.ietf.org/html/rfc6749#section-4.2
[MultiResponseType]:      https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html
[OIDC]:                   https://openid.net/connect/
[OIDCCore]:               https://openid.net/specs/openid-connect-core-1_0.html
[OIDCDiscovery]:          https://openid.net/specs/openid-connect-discovery-1_0.html
[PKCE]:                   https://www.authlete.com/developers/pkce/
[RFC6749]:                https://tools.ietf.org/html/rfc6749
[RFC7009]:                https://tools.ietf.org/html/rfc7009
[RFC7636]:                https://tools.ietf.org/html/rfc7636
[RFC7662]:                https://tools.ietf.org/html/rfc7662