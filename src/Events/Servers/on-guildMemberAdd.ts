import Canvas from "canvas";
import { Guild, Member } from "eris";
import KetClient from "../../Main";
import { guilds, channels } from "../../JSON/settings.json";
import { getColor } from "../../Components/Commands/CommandStructure";
import { readdirSync } from "fs";

module.exports = class guildMemberAddEvent {
    ket: KetClient;
    backgrounds: string[];
    constructor(ket: KetClient) {
        this.ket = ket;
        this.backgrounds = ["https://cdn.discordapp.com/attachments/881196761429979196/881418671703089253/wallpaper0.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418675033341962/wallpaper1.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418678124556288/wallpaper2.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418685540089856/wallpaper3.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418690602606632/wallpaper4.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418696210395136/wallpaper5.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418700920586270/wallpaper6.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418705525952522/wallpaper7.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418711058235412/wallpaper8.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418713381892126/wallpaper10.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418720440909865/wallpaper11.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418723481763901/wallpaper12.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418728321982464/wallpaper13.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418730444304415/wallpaper14.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418733803962368/wallpaper15.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418743979319296/wallpaper16.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418746768556032/wallpaper17.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418750283378688/wallpaper18.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418754662219786/wallpaper20.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418757451427850/wallpaper21.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418769166123008/wallpaper22.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418772550934558/wallpaper23.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418776841711656/wallpaper24.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418780432011264/wallpaper25.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418783049277450/wallpaper26.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418793572794438/wallpaper27.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418798169718804/wallpaper28.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418801512583168/wallpaper29.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418806583517204/wallpaper30.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418809582428171/wallpaper31.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418818491121704/wallpaper32.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418821238419456/wallpaper33.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418823956316210/wallpaper34.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418827127210054/wallpaper35.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418830767865876/wallpaper36.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418844340625458/wallpaper37.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418848958578688/wallpaper38.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418851840032768/wallpaper39.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418856806113300/wallpaper40.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418859209441380/wallpaper41.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418869707796511/wallpaper42.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418872832528384/wallpaper43.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418875445608498/wallpaper44.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418880080289862/wallpaper45.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418883217637386/wallpaper46.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418893950869534/wallpaper47.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418897427922994/wallpaper48.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418901005680640/wallpaper49.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418906714144828/wallpaper50.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418909830504458/wallpaper51.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418920148475934/wallpaper52.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418925445906482/wallpaper53.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418930927833119/wallpaper54.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418934753042442/wallpaper55.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418939249328168/wallpaper56.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418946308341781/wallpaper57.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418950313930793/wallpaper58.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418954168467466/wallpaper59.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418956974456882/wallpaper60.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418960019554334/wallpaper61.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418971742629898/wallpaper62.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418975270031370/wallpaper63.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418978386411570/wallpaper64.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418981850873886/wallpaper65.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418987752267886/wallpaper67.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418995960516669/wallpaper68.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881418999013986304/wallpaper69.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419004177162240/wallpaper70.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419009399066664/wallpaper71.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419012444160020/wallpaper72.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419021856145428/wallpaper73.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419025048035418/wallpaper74.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419029686910996/wallpaper75.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419032895557722/wallpaper77.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419038180409365/wallpaper78.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419046225055754/wallpaper79.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419049551155240/wallpaper80.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419053057593404/wallpaper81.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419057843306516/wallpaper82.jpg", "https://cdn.discordapp.com/attachments/881196761429979196/881419061664288778/wallpaper83.jpg"]

    }
    async on(guild: Guild, member: Member) {
        if (guild.id !== guilds.support) return;
        if (!member.user.dynamicAvatarURL())
            member = await this.ket.getRESTGuildMember(guild.id, member.id);

        const
            canvas = Canvas.createCanvas(1280, 720),
            ctx: any = canvas.getContext("2d"),
            welcomes = readdirSync(`${this.ket.rootDir}/Assets/welcome/`),
            masks = readdirSync(`${this.ket.rootDir}/Assets/masks/`),
            welcomeName = welcomes[Math.floor(Math.random() * welcomes.length)],
            isFullScreen = Boolean(welcomeName.startsWith('_'));

        const
            avatar = await Canvas.loadImage(member.user.dynamicAvatarURL('png', 400)),
            background = await Canvas.loadImage(this.backgrounds[Math.floor(Math.random() * this.backgrounds.length)]),
            welcome = await Canvas.loadImage(`${this.ket.rootDir}/Assets/welcome/${welcomeName}`),
            mask = await Canvas.loadImage(`${this.ket.rootDir}/Assets/masks/${masks[Math.floor(Math.random() * masks.length)]}`);

        ctx.drawImage(background, 0, 0, 1280, 720);
        ctx.drawImage(ctx.roundImageCanvas(avatar, 400, 400), 450, (isFullScreen ? 25 : 50), 400, 400);
        ctx.drawImage(mask, 445, 25, 410, 410);
        ctx.drawImage(welcome, 0, (isFullScreen ? 0 : 200), 1280, 720);

        this.ket.send({
            ctx: channels.homeWelcome, content: {
                content: member.mention,
                embeds: [{
                    color: getColor('red'),
                    title: `Seja bem viado(a) ${member.username}`,
                    description: `Leia o <:comunismo:852152065123024896> **NOSSO** <:comunismo:852152065123024896> <#845625693207527456> antes de conversar no servidor\n\n<a:cor:868338819521474661> Mude a cor do ~~**NOSSO**~~ seu nome em <#846729978467844097>\n\nEspero que goxte ;)`,
                    image: { url: 'attachment://welcum.jpg' },
                    footer: {
                        text: `🏆 Você é o ${guild.memberCount}º membro do servidor!`,
                        icon_url: member.user.dynamicAvatarURL('png', 18)
                    }
                }],
                files: [{ name: 'welcum.jpg', file: (canvas.toBuffer('image/jpeg')) }]
            }
        })
        return;
    }
}