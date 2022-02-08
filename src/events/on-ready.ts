import KetClient from "../KetClient";
import TerminalClient from "../Components/CLI/TerminalClient";
import gradient from "gradient-string";
import Prisma from "../Components/Database/PrismaConnection";

module.exports = class ReadyEvent {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
    }
    async on() {
        let status: object[] = [
            { name: 'no vasco', type: 0 },
            { name: 'sua mãe da janela', type: 0 },
            { name: 'sua mãe na panela', type: 0 },
            { name: "mais um gol do vasco", type: 3 },
            { name: "os gemidos da sua mãe", type: 2 },
            { name: 'Vasco x Flamengo', type: 5 }
        ];
        setInterval(async () => {
            //@ts-ignore
            this.ket.editStatus("dnd", status[Math.floor(Math.random() * status.length)]);

            (await this.prisma.blacklist.findMany()).forEach(async user => {
                if (user.warns < 3 && Date.now() > Number(user.timeout)) {
                    await this.prisma.users.update({
                        where: { id: user.id },
                        data: { banned: null }
                    });
                    await this.prisma.blacklist.delete({ where: { id: user.id } });
                }
            });
        }, 60_000)
        console.log('GATEWAY', `Sessão iniciada como ${this.ket.user.tag}`, 33);
        console.info(gradient('red', 'yellow')("◆ ▬▬▬▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬▬▬▬ ◆"));
        console.log(`Operante em ${this.ket.guilds.size} templos com ${this.ket.guilds.map(g => g.memberCount).reduce((acc, crt) => acc + crt) - this.ket.guilds.size} subordinados`);
        return TerminalClient(this.ket, this.prisma);
    }
}