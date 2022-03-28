import { getColor } from "../../Components/Commands/CommandStructure";
import { channels } from "../../JSON/settings.json";
import { Guild, User } from "eris";
import Event from "../../Components/Classes/Event";

module.exports = class guildDelete extends Event {
    public dir = __filename;

    public async on(guild: Guild) {
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
                        {
                            name: 'Proprietário',
                            value: `# ${(await this.ket.findUser(guild.ownerID) as User).tag}`.encode('md')
                        }
                    ]
                }]
            }
        })

        return;
    }
}