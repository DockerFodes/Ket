import { CommandContext, getEmoji } from "../../Components/Commands/CommandStructure";
import { SlashCommandBuilder } from "@discordjs/builders";
import { User, Message } from "eris";
import Command from "../../Components/Classes/Command";

module.exports = class userfake extends Command {
    public permissions = {
        bot: ['manageChannels', 'manageWebhooks']
    };
    public dontType = true;
    public dir = __filename;

    public async execute(ctx: CommandContext) {
        if (!ctx.args[1]) return ctx.send({ content: { embeds: [ctx.noargs] } });

        let user = await this.ket.findUser(ctx.env, false) as User,
            w = this.ket.webhooks.has(ctx.cID)
                ? this.ket.webhooks.get(ctx.cID)
                : (await this.ket.getChannelWebhooks(ctx.cID))
                    .find(w => w.user.id === this.ket.user.id);

        if (!user) return ctx.send({ content: { embeds: [ctx.noargs] } });

        if (this.ket.webhooks.has(ctx.cID)) w = this.ket.webhooks.get(ctx.cID);
        else {
            let webhooks = await this.ket.getChannelWebhooks(ctx.cID);

            if (webhooks[0] && webhooks.find(w => w.user.id === this.ket.user.id)) w = webhooks.find(w => w.user.id === this.ket.user.id)
            else w = await this.ket.createChannelWebhook(ctx.cID, {
                name: 'Ket',
                avatar: this.ket.user.dynamicAvatarURL('png'),
            }, 'userfake command');
        }

        if (ctx.env instanceof Message) ctx.env.delete().catch(() => { });
        else ctx.send({ content: getEmoji('autorizado').mention, flags: 64 });

        this.ket.executeWebhook(w.id, w.token, {
            content: ctx.args.slice(1).join(' '),
            username: user.username,
            avatarURL: user.dynamicAvatarURL('png'),
            allowedMentions: {
                everyone: false,
                roles: false,
                users: false
            }
        })

        return;
    }
}