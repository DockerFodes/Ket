import roles from "../../json/roles.json";
import { getEmoji, getColor } from "../../components/Commands/CommandStructure";

export default async function (interaction: any) {
    if (!['colors', 'notifications'].includes(interaction.data.custom_id) || interaction.data.component_type !== 3 || !roles[interaction.data.values[0]]) return;
    await interaction.defer(64).catch(() => { });
    let role = interaction.channel.guild.roles.get(roles[interaction.data.values[0]])

    if (!role) return interaction.createMessage({
        embeds: [{
            color: getColor('red'),
            description: `${getEmoji('negado').mention} **| Role not found!**`
        }]
    })
    try {
        interaction.channel.guild.roles.filter(r => r.name.includes('🌈') && interaction.member.roles.has(r.id))?.forEach(r => interaction.member.removeRole(r.id));
        await interaction.member.addRole(role.id);
        return interaction.createMessage({
            embeds: [{
                color: role.color,
                description: `${getEmoji('autorizado').mention} **| Role added!**`
            }]
        });
    } catch (e) {
    }
    let colorMsgObj = {
        embeds: [{
            title: 'ㅤ➯ Choose a color for you',
            color: getColor('red')
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'colors',
                options: [
                    { label: 'black', value: 'black', emoji: { name: 'black', id: '935389035109679175' } },
                    { label: 'white', value: 'white', emoji: { name: 'white', id: '935389222133702678' } },
                    { label: 'blue', value: 'blue', emoji: { name: 'blue', id: '935389349103669258' } },
                    { label: 'cyan', value: 'cyan', emoji: { name: 'cyan', id: '935389422424293496' } },
                    { label: 'green', value: 'green', emoji: { name: 'green', id: '935389498538348544' } },
                    { label: 'purple', value: 'purple', emoji: { name: 'purple', id: '935389546198212640' } },
                    { label: 'indigo', value: 'indigo', emoji: { name: 'indigo', id: '935389608861138995' } },
                    { label: 'lilac', value: 'lilac', emoji: { name: 'lilac', id: '935389670798393365' } },
                    { label: 'pink', value: 'pink', emoji: { name: 'pink', id: '935389727010488352' } },
                    { label: 'tomato', value: 'tomato', emoji: { name: 'tomato', id: '935389794513608704' } },
                    { label: 'red', value: 'red', emoji: { name: 'red', id: '935389845629566978' } },
                    { label: 'brown', value: 'brown', emoji: { name: 'brown', id: '935389894929432576' } },
                    { label: 'orange', value: 'orange', emoji: { name: 'orange', id: '935389945747603518' } },
                    { label: 'yellow', value: 'yellow', emoji: { name: 'yellow', id: '935389987535466517' } }
                ],
                placeholder: 'Click here',
                min_values: 1,
                max_values: 1
            }]
        }]
    }
    let notificationsMsgObj = {
        embeds: [{
            title: 'ㅤ➯ Choose a role for you',
            color: getColor('red')
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'notifications',
                options: [
                    { label: 'black', value: 'black', emoji: { name: 'black', id: '935389035109679175' } }
                ],
                placeholder: 'Click here',
                min_values: 1,
                max_values: 1
            }]
        }]
    }
}