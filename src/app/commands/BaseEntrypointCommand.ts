import BaseCommand, {
    DefaultInteraction,
    SlashCommandOption,
} from '@/app/commands/BaseCommand';
import BaseInternalCommand from '@/app/commands/BaseInternalCommand';
import Logger from '@/telemetry/logger';
import {Commandable} from '@/types/util';
import {Pipeline} from '@/util/Pipeline';
import {container, injectable} from 'tsyringe';

@injectable()
export default class BaseEntrypointCommand implements BaseCommand {
    public name = '';
    public description = '';
    public forwardables: Map<string, Commandable> = new Map();
    public options?: SlashCommandOption[];

    constructor(private logger: Logger) {}

    /**
     * Run the command
     */
    public async execute(interaction: DefaultInteraction): Promise<void> {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (!this.forwardables.has(subcommand)) {
                throw new Error(`Invalid subcommand ${subcommand}`);
            }

            const resolvable = this.forwardables.get(subcommand)!;
            const command = container.resolve(resolvable);

            const pipeline =
                container.resolve<Pipeline<DefaultInteraction>>(Pipeline);

            const passed = await pipeline
                .send(interaction as DefaultInteraction)
                .through(command.middleware ?? [])
                .go();

            // This has to be done here, because timing issues
            if ((command as BaseInternalCommand).shouldDeferReply) {
                await interaction.deferReply();
            }

            await command.execute(passed);
        } catch (err) {
            this.logger.fatal(
                'BaseEntrypointCommand',
                'Failed to execute command',
                err,
            );
        }
    }
}
