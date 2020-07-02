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

// Enable session process.
server.addProcess(new Session().process);

// Enable the custom process.
server.addProcess(authleteProcess);

// Set router.
const router = new Router();
router.get('/api/authorization',                async (context) => { await new AuthorizationEndpoint(context).get(); });
router.post('/api/authorization',               async (context) => { await new AuthorizationEndpoint(context).post(); });
router.post('/api/authorization/decision',      async (context) => { await new AuthorizationDecisionEndpoint(context).post(); });
router.post('/api/token',                       async (context) => { await new TokenEndpoint(context).post(); });
router.post('/api/introspection',               async (context) => { await new IntrospectionEndpoint(context).post(); });
router.post('/api/revocation',                  async (context) => { await new RevocationEndpoint(context).post(); });
router.get('/api/jwks',                         async (context) => { await new JwksEndpoint(context).get(); });
router.get('/.well-known/openid-configuration', async (context) => { await new ConfigurationEndpoint(context).get(); });

// Set controller.
server.setController(router.controller);

// Set logger.
server.logger.changeLevel('INFO');

// Set port.
server.port = 1902;

// Start the server.
server.start();