interface CommandConfig {
    name?: string;
    aliases?: string[];
    category?: string;
    cooldown?: number;
    permissions?: {
        user?: string[];
        bot?: string[];
        onlyDevs?: boolean;
    }
    access?: {
        DM?: boolean;
        Threads?: boolean;
    }
    dontType?: boolean;
    testCommand?: string[];
    slash?: any;
    dir: string;
    config?: any;
}

interface EventConfig {
    name?: string;
    category?: string;
    type: number;
    disabled?: boolean
    dir: string;
    KetUtils?: any;
    ket: any;
    postgres: any;
    on: any;
}