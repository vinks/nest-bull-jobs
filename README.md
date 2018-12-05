<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="http://kamilmysliwiec.com/public/nest-logo.png#1" alt="Nest Logo" /></a>
</p>

## Description

This is a [Bull](https://github.com/OptimalBits/bull) task wrapper module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save nest-bull-jobs bull
$ npm i --save-dev @types/bull
```

## Quick Start

```ts
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

import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BullModule, BullTaskRegisterService } from '../lib';
import { AppTasks } from './app.tasks';
import { AppController } from './app.controller';

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
      this.taskRegister.register(AppTasks);
  }
}
```