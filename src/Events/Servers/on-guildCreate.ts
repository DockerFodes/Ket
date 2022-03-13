import KetClient from "../../Main";
import { Guild, User } from "eris";
import { channels } from "../../JSON/settings.json";
import { getColor } from "../../Components/Commands/CommandStructure";

module.exports = class guildCreateEvent {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
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