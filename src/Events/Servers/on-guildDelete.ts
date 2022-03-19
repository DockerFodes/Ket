import { PostgresClient } from "../../Components/Typings/Database";
import { Guild, User } from "eris";
import { channels } from "../../JSON/settings.json";
import { getColor } from "../../Components/Commands/CommandStructure";
import KetClient from "../../Main";

module.exports = class guildDeleteEvent {
    ket: KetClient;
    postgres: PostgresClient;
    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
    }
    async on(guild: Guild) {
        this.ket.send({
            ctx: channels.guildDelete, emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    title: guild.name,
                    thumbnail: { url: guild.dynamicIconURL('png') },
                    description: `Agora eu tenho ${this.ket.guilds.size} servidores :(`,
                    fields: [
                        { name: 'ID:', value: guild.id.encode('cs'), inline: true },
                        { name: 'Membros', value: String(guild.memberCount).encode('fix'), inline: true },
                        { name: 'Proprietário', value: `# ${(await this.ket.findUser(guild.ownerID) as User).tag}`.encode('md') }
                    ]
                }]
            }
        })

        return;
    }
}