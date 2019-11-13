import { Module } from '@nestjs/common';
import { BullService } from './bull.service';
import { BullTaskRegisterService } from './bull-task-register.service';

@Module({
    providers: [
        BullService,
        BullTaskRegisterService,
    ],
    exports: [BullService, BullTaskRegisterService],
})
export class BullModule {}