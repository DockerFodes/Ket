module.exports = class ErrorEvent {
    async start(error: string, shardID: number) {
        return global.session.log('error', `Shard ${shardID}`, `Erro detectado:`, error);
    }
}