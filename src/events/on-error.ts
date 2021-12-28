module.exports = class ErrorEvent {
    constructor() {}
    async start(error: string, shardID: number) {
        return global.session.log('error', `Shard ${shardID}`, `Erro detectado:`, error);
    }
}