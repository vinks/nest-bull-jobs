import { Injectable } from '@nestjs/common';
import Bull = require('bull');
import { Task } from '../lib';

@Injectable()
export class AppTasks {
    @Task({ name: 'justATest' })
    justATest(job: Bull.Job, done: Bull.DoneCallback) {
        const result: number = (job.data || []).reduce((a, b) => a + b);

        done(null, result);
    }
}