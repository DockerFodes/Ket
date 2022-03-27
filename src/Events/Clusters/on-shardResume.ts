import Event from "../../Components/Classes/Event";

module.exports = class ShardResume extends Event {
    public dir = __filename;

    async on(shardID: number) {
        this.ket.emit('shardReady', shardID);
        return;
    }
}