module.exports = class ErrorEvent {
    ket: any;
    constructor(ket: any) {
        this.ket = ket;
    }
    async start(error: string, shardID: number) {
        return global.client.log('error', `Shard ${shardID}`, `Erro detectado:`, error);
    }
}