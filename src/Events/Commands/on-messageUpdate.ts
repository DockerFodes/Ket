import { GuildChannel, Message, User } from "eris";
import { globalchat, guilds } from "../../JSON/settings.json";
import Event from "../../Components/Classes/Event";

module.exports = class MessageUpdate extends Event {
    public dir = __filename;

    async on(newMsg: Message<any>, oldMsg: Message) {
        if ((String(oldMsg?.content).trim() === String(newMsg?.content).trim() && !newMsg.editedTimestamp) || newMsg.author?.bot) return;

        if (newMsg.channel.parentID === guilds.dmCategory) {
            let DMChannel = (await (await this.ket.findUser(newMsg.channel.topic) as User).getDMChannel()),
                msg = await this.ket.findMessage(DMChannel, { content: oldMsg.content, limit: 25 });

            this.ket.editMessage(DMChannel.id, msg.id, { content: newMsg.content })
                .catch((e) => this.ket.send({ ctx: newMsg.channel.msgID, content: `Não foi possível \`editar\` a sua mensagem\n\n${e}` }))

            return;
        }

        const guild = await this.postgres.servers.find(newMsg.guildID)

        if (newMsg.channel.id !== guild.globalchat) {
            this.ket.emit("messageCreate", newMsg);
            return;
        }

        const user = await this.postgres.users.find(newMsg.author.id),
            msg = await this.postgres.globalchat.find(newMsg.id);

        if (user.banned || !msg || Date.now() > newMsg.timestamp + (15 * 1000 * 60) || Number(msg.editCount) >= globalchat.editLimit)
            return;

        msg.messages.forEach(async (data) => {
            let id = data.split('|')[0],
                server = await this.postgres.servers.find(data.split('|')[1]),
                channel: GuildChannel = this.ket.guilds.get(server.id).channels.get(server.globalchat),
                webhook = this.ket.webhooks.get(channel.id);

            if (!webhook) {
                webhook = (await this.ket.getChannelWebhooks(server.globalchat)).find(w => w.name === 'Ket' && w.user.id === this.ket.user.id);
                if (!webhook) return;
            }

            this.ket.editWebhookMessage(webhook.id, webhook.token, id, {
                content: this.KetUtils.msgFilter(newMsg.cleanContent),
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            })
                .catch(() => { })
        })

        await this.postgres.globalchat.update(msg.id, { editCount: msg.editCount });

        return;
    }
}