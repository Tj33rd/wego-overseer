import Logger from '@/telemetry/logger';
import {isAdmin} from '@/util/discord';
import {trans} from '@/util/localization';
import {pad} from '@/util/misc';
import dayjs from 'dayjs';
import InternalCommand from '../InternalCommand';
import {
    ensureGuildIsAvailable,
    ensureUserIsAvailable,
} from '../karma/KarmaCommand/predicates';
import {bindUserToGuild} from './predicates/bindUserToGuild';

const logger = new Logger('wego-overseer:BirthdaySetCommand');

export const BirthdaySetCommand = new InternalCommand({
    run: async (interaction, _, {db}) => {
        try {
            const requester = interaction.user;
            const target = interaction.options.getUser('user') ?? requester;

            const user = await ensureUserIsAvailable(target?.id);
            const guild = await ensureGuildIsAvailable(interaction.guildId);

            await bindUserToGuild(db, user, guild);

            // If requester is not an admin, but tries to change someone else's birthday
            if (requester.id !== target?.id && !isAdmin(interaction)) {
                throw new Error(
                    "Requester tried to change target's birtday, but is not an administrator.",
                );
            }

            const birthDate = [
                interaction.options.getNumber('date_year'),
                pad(interaction.options.getNumber('date_month'), 2),
                pad(interaction.options.getNumber('date_day'), 2),
            ];

            const date = dayjs(birthDate.join('/'));

            await user.$query().update({
                dateOfBirth: date.format('YYYY-MM-DD'),
            });

            const message = requester.id === target.id
                ? trans('commands.birthday.set.self.success', date.format('MM/DD'))
                : trans('commands.birthday.set.other_user.success', target.username, date.format('MM/DD'));

            await interaction.followUp(message);

        } catch (err) {
            logger.fatal('Unable to handle BirthdaySetCommand', err);
            await interaction.followUp(trans('commands.birthday.set.failure'));
        }
    },
});
