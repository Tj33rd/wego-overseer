import {DefaultInteraction} from '@/app/commands/BaseCommand';
import Channel from '@/app/entities/Channel';
import BaseMiddleware, {NextFn} from '@/app/middleware/BaseMiddleware';
import ChannelRepository from '@/app/repositories/ChannelRepository';
import {injectable} from 'tsyringe';

@injectable()
export default class EnsureChannelIsAvailable<
    T extends DefaultInteraction = DefaultInteraction,
> extends BaseMiddleware<T> {
    constructor(private channelRepository: ChannelRepository) {
        super();
    }

    /**
     * Run the middleware
     */
    public async handle(ctx: T, next: NextFn<T>): Promise<void> {
        const channelId = ctx.options.getChannel('channel')?.id ?? '';
        const channel = await this.channelRepository.getById(channelId);

        if (!(channel instanceof Channel)) {
            await this.channelRepository.create({id: channelId});
        }

        await next(ctx);
    }
}
