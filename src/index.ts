import 'dotenv/config';
import Bot from '@/Bot';
import Logger from '@/telemetry/logger';
import knex from 'knex';
import knexfile from '../knexfile';
import {Model} from 'objection';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {Maybe} from '@/types/util';
import {KortebroekCommand} from '@/commands/KortebroekCommand';
import {PingCommand} from '@/commands/PingCommand';
import {StufiCommand} from '@/commands/StufiCommand';
import {HelpCommand} from '@/commands/HelpCommand';
import {WhereMemeCommand} from '@/commands/WhereMemeCommand';
import {IAmDadEvent} from './events/IAmDadEvent';
import {BangerEvent} from './events/BangerEvent';
import {SpooktoberCommand} from './commands/SpooktoberCommand';
import {DeepFryCommand} from './commands/DeepFryCommand';
import {JokeMemeCommand} from './commands/JokeMemeCommand';
import {MockifyCommand} from './commands/MockifyCommand';
import {DrakeMemeCommand} from './commands/DrakeMemeCommand';
import {UwuCommand} from './commands/UwuCommand';
import {MarieKondoCommand} from './commands/MarieKondoCommand';
import {I18n} from 'i18n';

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID ?? '';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN ?? '';

const logger = new Logger('wego-overseer:index');

export let bot: Maybe<Bot> = null;

export const i18n = new I18n({
    directory: __dirname + '/lang',
});

// Setup knex connection for objection
Model.knex(knex(knexfile));

dayjs.extend(utc);
dayjs.extend(timezone);

(async () => {
    bot = new Bot({
        applicationId: DISCORD_APPLICATION_ID,
        token: DISCORD_TOKEN,
        commands: [
            PingCommand,
            KortebroekCommand,
            StufiCommand,
            WhereMemeCommand,
            SpooktoberCommand,
            HelpCommand,
            DeepFryCommand,
            JokeMemeCommand,
            MockifyCommand,
            DrakeMemeCommand,
            UwuCommand,
            MarieKondoCommand,
        ],
        events: [IAmDadEvent, BangerEvent],
    });

    try {
        const client = await bot.boot();
        logger.info(`Bot now ready and listening as '${client.user?.tag}'`);
    } catch (err) {
        logger.fatal(err);
    }
})();
