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


import { Session } from 'https://deno.land/x/fen/process/session.ts';
import { Server } from 'https://deno.land/x/fen/server.ts';
import { Router } from 'https://deno.land/x/fen/tool/router.ts';
import { AuthleteApiFactory } from 'https://github.com/authlete/authlete-deno/raw/master/mod.ts';
import { AuthorizationDecisionEndpoint } from './endpoint/authorization_decision_endpoint.ts';
import { AuthorizationEndpoint } from './endpoint/authorization_endpoint.ts';
import { ConfigurationEndpoint } from './endpoint/configuration_endpoint.ts';
import { IntrospectionEndpoint } from './endpoint/introspection_endpoint.ts';
import { JwksEndpoint } from './endpoint/jwks_endpoint.ts';
import { RevocationEndpoint } from './endpoint/revocation_endpoint.ts';
import { TokenEndpoint } from './endpoint/token_endpoint.ts';
import { authleteProcess } from './process/authlete_process.ts';


// Server instance.
const server = new Server();

// Process.
server.addProcess(new Session().process);
server.addProcess(authleteProcess);

// Router.
const router = new Router();
const api = await AuthleteApiFactory.getDefault();
router.get('/api/authorization',                async (context) => { await new AuthorizationEndpoint(api, context).get(); });
router.post('/api/authorization',               async (context) => { await new AuthorizationEndpoint(api, context).post(); });
router.post('/api/authorization/decision',      async (context) => { await new AuthorizationDecisionEndpoint(api, context).post(); });
router.post('/api/token',                       async (context) => { await new TokenEndpoint(api, context).post(); });
router.post('/api/introspection',               async (context) => { await new IntrospectionEndpoint(api, context).post(); });
router.post('/api/revocation',                  async (context) => { await new RevocationEndpoint(api, context).post(); });
router.get('/api/jwks',                         async (context) => { await new JwksEndpoint(api, context).get(); });
router.get('/.well-known/openid-configuration', async (context) => { await new ConfigurationEndpoint(api, context).get(); });

// Controller.
server.setController(router.controller);

// Logger.
server.logger.changeLevel('INFO');

// Port.
server.port = 1902;

// Start the server.
server.start();