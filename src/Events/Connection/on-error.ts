module.exports = class ErrorEvent {
    async on(error: string, shardID: number) {
        console.log(`SHARD ${shardID}`, error, 41);
        return;
    }
}