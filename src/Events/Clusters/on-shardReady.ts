import Event from "../../Components/Classes/Event";
import { infoEmbed } from "../../Components/Commands/CommandStructure";

module.exports = class ShardReady extends Event {
    public dir = __filename;

    async on(shardID: number) {
        console.log(`SHARD ${shardID}`, 'Conectada ao Discord', 34);
        this.ket.shardUptime.set(shardID, Date.now());

        if (global.PROD)
            infoEmbed(shardID, this.ket);

        return;
    }
}