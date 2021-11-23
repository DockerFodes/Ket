const moment = require('moment')

module.exports = class ShardReadyEvent {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start(shardID) {
        global.log('shard', "SHARDING MANAGER", `Shard ${shardID} acordou`)
        this.ket.shardUptime.set(shardID, {
            id: shardID,
            uptime: Date.now()
        })
        async function infoEmbed(shardID, ket) {
            let embed = { title: `${global.emoji.axo} **Bot Info** ${global.emoji.axo}`, description: `Bot Uptime 🗓️: \`\`\`fix\n${ket.startTime === 0 ? 'Iniciando...' : moment.duration(Date.now() - ket.startTime).format(" dd[d] hh[h] mm[m] ss[s]")}\`\`\` `,
                fields: [{name: `Servers 🌎:`, value: `\`\`\`cs\n${ket.guilds.size}\`\`\``, inline: true}, {name: `Users 👥:`, value: `\`\`\`cs\n${ket.users.size}\`\`\``, inline: true},
                    {name: `RAM 🎞️:`, value: `\`\`\`fix\n${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB\`\`\``, inline: true}
                ]   
            }
            ket.shards.forEach(s => { let status = 'unknown'
                switch(s.status) { case 'ready': status = `online ${global.emoji.online}`
                        break 
                    case 'connecting': status = `conectando ${global.emoji.idle}`
                        break
                    case 'disconnected': status = `offline ${global.emoji.offline}`
                }
                embed.fields.push({ name: `${global.emoji.cristal} ${s.id}`,
                    value: `${status}\`\`\`fix\n${!ket.shardUptime.get(s.id) ? '-1' : moment.duration(Date.now() - ket.shardUptime.get(s.id).uptime).format(" dd[d] hh[h] mm[m] ss[s]")}\`\`\``, inline: true
                })
            })
            if(shardID === 0) return ket.createMessage(ket.config.STARTUP_MESSAGE.chat, { embeds: [embed] }).then(msg => ket.config.STARTUP_MESSAGE.id = msg.id).catch({})
            else return ket.editMessage(ket.config.STARTUP_MESSAGE.chat, ket.config.STARTUP_MESSAGE.id, { embeds: [embed] }).catch({})
        }
        global.infoEmbed = infoEmbed
        return infoEmbed(shardID, this.ket)
    }
}