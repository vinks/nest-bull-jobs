import { Controller, Get } from '@nestjs/common';
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
        const opt: Bull.JobOptions = { lifo: true };
        const data = [1, 2, 3];

        const result = await this.bullService.createJob(this.tasks.justATest, data, opt).then((job) => {
            return job.finished();
        });

        return result;
    }
}