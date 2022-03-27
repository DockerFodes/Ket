import Event from "../../Components/Classes/Event";

module.exports = class Error extends Event {
    public dir = __filename;
    async on(error: string, shardID: number) {
        console.log(`SHARD ${shardID}`, error, 31);
        return;
    }
}