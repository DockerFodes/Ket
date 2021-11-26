export interface config {
    name: string;
    aliases: Array<string>;
    category: string;
    cooldown: number;
    permissions: object;
    access: object;
    testCommand: Array<string>;
    slashData: any
}
module.exports = class CommandStructure {
    ket: any
    config: object
	constructor(ket, command) {
		this.config = {
			name: command.name || null,
			aliases: command.aliases || [],
			category: command.category || "util",
            cooldown: command.cooldown || 3,
			permissions: command.permissions || {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: command.access || {
                DM: true,
                Threads: true
            },
			testCommand: command.testCommand || [],
            slashData: command.slashData
		}
		this.ket = ket
	}
}