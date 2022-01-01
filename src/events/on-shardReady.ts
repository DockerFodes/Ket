export { };
import { Client } from "eris"
const
    { Decoration } = require('../components/Commands/CommandStructure'),
    moment = require('moment'),
    emoji = Decoration.getEmoji;

module.exports = class ShardReadyEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(shardID: number) {
        global.session.log('shard', "SHARDING MANAGER", `Shard ${shardID} acordou`);
        this.ket.shardUptime.set(shardID, {
            id: shardID,
            uptime: Date.now()
        });
        // async function infoEmbed(shardID, ket) {
        //     let embed = {
        //         title: `${emoji('axo')} **Bot Info** ${emoji('axo')}`, description: `Bot Uptime 🗓️: \`\`\`fix\n${ket.startTime === 0 ? 'Iniciando...' : moment.duration(Date.now() - ket.startTime).}\`\`\` `,
        //         fields: [{ name: `Servers 🌎:`, value: `\`\`\`cs\n${ket.guilds.size}\`\`\``, inline: true }, { name: `Users 👥:`, value: `\`\`\`cs\n${ket.users.size}\`\`\``, inline: true },
        //         { name: `RAM 🎞️:`, value: `\`\`\`fix\n${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB\`\`\``, inline: true }
        //         ]
        //     };
        //     ket.shards.forEach(s => {
        //         let status = 'unknown'
        //         switch (s.status) {
        //             case 'ready': status = `online ${emoji('online')}`
        //                 break
        //             case 'connecting': status = `conectando ${emoji('idle')}`
        //                 break
        //             case 'disconnected': status = `offline ${emoji('offline')}`
        //         }
        //         embed.fields.push({
        //             name: `${emoji('cristal')} ${s.id}`,
        //             value: `${status}\`\`\`fix\n${!ket.shardUptime.get(s.id) ? '-1' : moment.duration(Date.now() - ket.shardUptime.get(s.id).uptime).format(" dd[d] hh[h] mm[m] ss[s]")}\`\`\``, inline: true
        //         })
        //     });
        //     if (shardID === 0 && !ket.ready) return ket.createMessage(ket.config.channels.startupMessage.channel, { embeds: [embed] }).then(msg => ket.config.channels.startupMessage.id = msg.id).catch({});
        //     else return ket.editMessage(ket.config.channels.startupMessage.channel, ket.config.channels.startupMessage.id, { embeds: [embed] }).catch({});
        // }
        //global.infoEmbed = infoEmbed
        return;// infoEmbed(shardID, this.ket)
    }
}