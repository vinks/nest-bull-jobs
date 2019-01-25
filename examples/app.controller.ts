import { Controller, Get } from '@nestjs/common';
import * as uuid from 'uuid';
import * as Bull from 'bull';
import { BullService } from '../lib';
import { AppTasks } from './app.tasks';

@Controller('app')
export class AppController {
    constructor(
        private readonly bullService: BullService,
        private readonly tasks: AppTasks,
    ) {}

    @Get()
    public async runTask() {
        const opt: Bull.JobOptions = { jobId: uuid() };
        const a = 1;
        const b = 2;

        const result = await this.bullService.createJob(this.tasks.justATest, {a, b}, opt).then((job) => {
            return job.finished();
        });

        return result;
    }

    @Get('queue')
    public async getQueue() {
        const queue = this.bullService.getQueue('myName');

        const counts = await queue.getJobCounts();
        const waiting = await queue.getWaiting();
        const active = await queue.getActive();
        const completed = await queue.getCompleted();
        const delayed = await queue.getDelayed();
        const failed = await queue.getFailed();

        return { counts, waiting, active, completed, delayed, failed };
    }

    @Get('clear')
    public async clearQueue() {
        const queue = this.bullService.getQueue('myName');

        const completed = await queue.clean(30000, 'completed');
        const waiting = await queue.clean(30000, 'wait');
        const active = await queue.clean(30000, 'active');
        const delayed = await queue.clean(30000, 'delayed');
        const failed = await queue.clean(30000, 'failed');

        return { waiting, active, completed, delayed, failed };
    }
}