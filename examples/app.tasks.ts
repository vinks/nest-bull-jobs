import { Injectable } from '@nestjs/common';
import Bull = require('bull');
import { Task } from '../lib';

async function sleep(delay) {
    return new Promise((ok) => {
      setTimeout(ok, delay * 1000);
    });
}

async function addFunc(a, b, cb) {
    await sleep(1);
    cb(1);
    await sleep(2);
    cb(2);
    await sleep(2);
    return a + b;
}

@Injectable()
export class AppTasks {
    @Task({ name: 'justATest' })
    async justATest(job: Bull.Job, done: Bull.DoneCallback) {
        const result = await addFunc(
            job.data.a,
            job.data.b,
            (data) => {
              job.progress(data);
            },
        );

        job.progress(0);

        done(null, result);
    }
}