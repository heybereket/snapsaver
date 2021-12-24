import Fastify from 'fastify';
import cors from 'fastify-cors';
import autoLoad from 'fastify-autoload';
import 'dotenv/config';

import {join} from 'path';
import {PORT} from './lib/constants';
import * as log from './lib/log';

const fastify = Fastify();

void fastify.register(autoLoad, {
	dir: join(__dirname, './routes'),
	options: {prefix: '/v1'},
});

void fastify.register(cors, {
	credentials: true,
	origin: ['https://snapsaver.me', 'https://www.snapsaver.me', 'http://localhost:3000'],
	methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
});

// Default Route
fastify.get('/', async (request, reply) => {
	reply.send({
		name: 'MyBio API',
		version: '1.0.0',
	});
});

fastify.addHook('onRequest', (request, reply, done) => {
	const route = request.url;
	const method = request.method;
	const ip = request.ip;

	log.event(`${route} | ${method} | ${ip}`);
	done();
});

fastify.listen(PORT, '0.0.0.0', (err, address) => {
	if (err) throw err;
	log.ready(`API > Running on ${address}`);
});