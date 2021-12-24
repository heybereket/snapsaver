import {FastifyPluginCallback} from 'fastify';

const hi: FastifyPluginCallback = async fastify => {
	fastify.get('/hi', async (req, res) => {
		await res.send({
			success: true,
			message: 'hi',
		});
	});
};

export default hi;