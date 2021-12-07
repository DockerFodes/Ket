module.exports = class ErrorEvent {
    constructor() {}
    async start(error: string, shardID: number) {
        return global.client.log('error', `Shard ${shardID}`, `Erro detectado:`, error);
    }
}