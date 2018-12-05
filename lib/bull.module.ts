import { Module } from '@nestjs/common';
import { BullService } from './bull.service';
import { BullTaskRegisterService } from './bull-task-register.service';
import { FancyLoggerService } from './fancy-logger.service';

@Module({
    providers: [
        BullService,
        BullTaskRegisterService,
        FancyLoggerService,
    ],
    exports: [BullService, BullTaskRegisterService],
})
export class BullModule {}