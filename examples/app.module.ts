import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BullModule, BullTaskRegisterService } from '../lib';
import { AppTasks } from './app.tasks';
import { AppController } from './app.controller';
import { AdvancedSettings, QueueOptions, RateLimiter } from 'bull';

@Module({
  imports: [BullModule],
  controllers: [AppController],
  providers: [AppTasks],
})
export class AppModule implements OnModuleInit {
  constructor(
      private readonly moduleRef: ModuleRef,
      private readonly taskRegister: BullTaskRegisterService,
  ) {}
  onModuleInit() {
      this.taskRegister.setModuleRef(this.moduleRef);

      const limiter: RateLimiter = {
        // Max number of jobs processed
        max: 5,
        // per duration in milliseconds
        duration: 1000,
      };

      const settings: AdvancedSettings = {
        // Key expiration time for job locks.
        lockDuration: 30000,
        // How often check for stalled jobs (use 0 for never checking).
        stalledInterval: 30000,
        // Max amount of times a stalled job will be re-processed.
        maxStalledCount: 1,
        // Poll interval for delayed jobs and added jobs.
        guardInterval: 5000,
        // delay before processing next job in case of internal error.
        retryProcessDelay: 5000,
        // A set of custom backoff strategies keyed by name.
        backoffStrategies: {},
        // A timeout for when the queue is in drained state (empty waiting for jobs).
        drainDelay: 5,
      };

      const defaultJobOptions = {
        // Optional priority value. ranges from 1 (highest priority) to MAX_INT  (lowest priority).
        // Note that using priorities has a slight impact on performance, so do not use it if not required.
        priority: 1,
        // An amount of miliseconds to wait until this job can be processed. Note that for accurate delays,
        // both server and clients should have their clocks synchronized. [optional].
        delay: 500,
        // The total number of attempts to try the job until it completes.
        attempts: 3,
        // if true, adds the job to the right of the queue instead of the left (default false)
        lifo: false,
        // The number of milliseconds after which the job should be fail with a timeout error [optional]
        timeout: 1000,
        // If true, removes the job when it successfully
        // completes. Default behavior is to keep the job in the completed set.
        removeOnComplete: true,
        // If true, removes the job when it fails after all attempts.
        // Default behavior is to keep the job in the failed set.
        removeOnFail: false,
      };

      const queueOptions: QueueOptions = {
        limiter,
        redis: {
          port: 6379,
          host: 'localhost',
        },
        prefix: 'my_prefix', // prefix for all queue keys.
        defaultJobOptions,
        settings,
      };

      this.taskRegister.register(AppTasks, {
        queue: 'myName',
        concurrency: 10,
        options: queueOptions,
      });
  }
}