interface CommandConfig {
    name?: string;
    aliases?: string[];
    category?: string;
    cooldown?: number;
    permissions?: {
        user?: permissions[];
        bot?: permissions[];
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

type permissions = 'createInstantInvite' |
    'kickMembers' |
    'banMembers' |
    'administrator' |
    'manageChannels' |
    'manageGuild' |
    'addReactions' |
    'viewAuditLog' |
    'voicePrioritySpeaker' |
    'voiceStream' |
    'stream' |
    'viewChannel' |
    'readMessages' |
    'sendMessages' |
    'sendTTSMessages' |
    'manageMessages' |
    'embedLinks' |
    'attachFiles' |
    'readMessageHistory' |
    'mentionEveryone' |
    'useExternalEmojis' |
    'externalEmojis' |
    'viewGuildInsights' |
    'voiceConnect' |
    'voiceSpeak' |
    'voiceMuteMembers' |
    'voiceDeafenMembers' |
    'voiceMoveMembers' |
    'voiceUseVAD' |
    'changeNickname' |
    'manageNicknames' |
    'manageRoles' |
    'manageWebhooks' |
    'manageEmojisAndStickers' |
    'manageEmojis' |
    'useApplicationCommands' |
    'useSlashCommands' |
    'voiceRequestToSpeak' |
    'manageEvents' |
    'manageThreads' |
    'createPublicThreads' |
    'createPrivateThreads' |
    'useExternalStickers' |
    'sendMessagesInThreads' |
    'startEmbeddedActivities' |
    'allGuild' |
    'allText' |
    'allVoice' |
    'all'