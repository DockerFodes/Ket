import { PostgresClient } from "../../Components/Typings/Database";
import { getColor } from "../../Components/Commands/CommandStructure";
import { channels } from "../../JSON/settings.json";
import { Guild, User } from "eris";
import KetClient from "../../Main";

module.exports = class guildCreateEvent {
    ket: KetClient;
    postgres: PostgresClient;
    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
    }
    async on(guild: Guild) {
        this.ket.send({
            ctx: channels.guildCreate, emoji: 'autorizado', content: {
                embeds: [{
                    title: guild.name,
                    color: getColor('green'),
                    thumbnail: { url: guild.dynamicIconURL('png') },
                    description: `Agora eu tenho \`${this.ket.guilds.size}\` servidores :)`,
                    fields: [
                        { name: `ID:`, value: guild.id.encode('cs'), inline: true },
                        { name: `Membros:`, value: String(guild.memberCount).encode('fix'), inline: true },
                        { name: `Proprietário do Servidor:`, value: `# ${(await this.ket.findUser(guild.ownerID) as User).tag}`.encode('md'), inline: false },
                        { name: `Usuário que adicionou:`, value: `- null`.encode('diff'), inline: true },
                    ]
                }]
            }
        })

        return;
    }
}