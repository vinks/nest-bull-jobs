import { Injectable, Logger } from '@nestjs/common';
import { TaskMetadata } from './bull.utils';
import { Controller } from '@nestjs/common/interfaces';
import * as Bull from 'bull';
import * as Bluebird from 'bluebird';

@Injectable()
export class BullService {
    private static readonly DEFAULT_CONCURRENCY: number = 3;
    private static readonly DEFAULT_QUEUE_NAME: string = 'default';
    private static readonly DEBUG_EVENTS: Array<string> = [
        'job enqueue',
        'job complete',
        'job failed attempt',
        'job failed',
    ];

    private queues: { [name: string]: Bull.Queue } = {};
    private tasks: { [name: string]: TaskMetadata } = {};
    private debugActive: boolean = false;
    private logger: Logger = new Logger('Bull tasks');

    public registerTask(task: (job, done) => void, metadata: TaskMetadata, ctrl: Controller) {
        const queueName: string = metadata.queue || BullService.DEFAULT_QUEUE_NAME;
        const concurrency: number = metadata.concurrency || BullService.DEFAULT_CONCURRENCY;

        if (!this.queues[queueName]) {
            this.queues[queueName] = this.createQueue(queueName, metadata.options);
        }

        this.queues[queueName].process(metadata.name, concurrency, async (j, d) => {
            return Promise.resolve(task.call(ctrl, j, d));
        });

        this.tasks[metadata.name] = metadata;
    }

    public getQueues() {
        return this.queues;
    }

    public getQueue(name: string): Bull.Queue {
        const queueName: string = name || BullService.DEFAULT_QUEUE_NAME;
        const queue: Bull.Queue = this.getQueues()[queueName];

        return queue;
    }

    public createJob(task, data: Object, opts?: Bull.JobOptions): Bluebird<Bull.Job<any>> {
        const metadata: TaskMetadata = this.tasks[task.name];
        const queue: Bull.Queue = this.getQueue(metadata.queue);

        return queue.add(metadata.name, data, opts);
    }

    public getJob(jobId: Bull.JobId, queueName?: string): Promise<Bull.Job> {
      return new Promise((resolve, reject) => {
            const queue: Bull.Queue = this.getQueue(queueName);

            queue.getJob(jobId).then( (job?: Bull.Job) => {
                return resolve(job);
            });
        });
    }

    private createQueue(queueName: string, queueOptions?: Bull.QueueOptions): Bull.Queue {
        if (!queueName) {
            throw new Error('No queueName provided');
        }

        this.logger.log(JSON.stringify({ queue: queueName, ...queueOptions }), 'BullModule create queue');

        const queue: Bull.Queue = new Bull(queueName, queueOptions);

        if (!this.debugActive && process.env.NESTJS_BULL_DEBUG && queueName === BullService.DEFAULT_QUEUE_NAME) {
            this.debugActive = true;
            this.bindDebugQueueEvents(queue);
        }

        return queue;
    }

    private bindDebugQueueEvents(queue: Bull.Queue) {
        for (const event of BullService.DEBUG_EVENTS) {
            queue.on(event, (job: Bull.Job) => {
                if (job) {
                    this.debugLog(job, event);
                }
            });
        }

        queue.on('error', (err: Error) => {
           if (err) {
               this.debugLog(undefined, 'job error', err);
           }
        });
    }

    private debugLog(job: Bull.Job, event: string, err?) {
        const log = { job, event, err };
        this.logger.error(log, 'BullModule');
    }
}
