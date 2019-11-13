import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { TaskMetadataExplorer } from './bull-task-metadata.explorer';
import { BullService } from './bull.service';
import { TaskRegisterMetadata } from './bull.utils';

export class InvalidModuleRefException extends Error {
    constructor() {
        super(`Invalid ModuleRef exception. Remember to set module reference "setModuleRef()".`);
    }
}

@Injectable()
export class BullTaskRegisterService {
    private moduleRef: ModuleRef = null;
    private readonly moduleName: string = 'BullModule';
    private readonly metadataExplorer: TaskMetadataExplorer;
    private logger: Logger = new Logger('Bull tasks');

    constructor(
        private readonly bullService: BullService,
    ) {
        this.metadataExplorer = new TaskMetadataExplorer(
            new MetadataScanner(),
        );
    }

    setModuleRef(moduleRef) {
        this.moduleRef = moduleRef;
    }

    register(tasks, metaData?: TaskRegisterMetadata) {
        if (!this.moduleRef) {
            throw new InvalidModuleRefException();
        }

        const instance = this.moduleRef.get(tasks);

        if (!instance) {
            return;
        }

        this.createTasks(instance, metaData);
    }

    createTasks(instance, metaData?: TaskRegisterMetadata) {
        for (const { task, metadata } of this.metadataExplorer.explore(instance)) {
            if (metaData) {
                if (metaData.concurrency) {
                    Object.assign(metadata, { concurrency: metaData.concurrency });
                }

                if (metaData.queue) {
                    Object.assign(metadata, { queue: metaData.queue });
                }

                if (metaData.options) {
                    Object.assign(metadata, {
                        options: Object.assign({}, metadata.options || {}, metaData.options),
                    });
                }
            }

            this.bullService.registerTask(task, metadata, instance);

            const taskDesc = {
                name: metadata.name,
                queue: metadata.queue,
                concurrency: metadata.concurrency,
            };

            this.logger.log(JSON.stringify(taskDesc), 'BullModule register task');
        }
    }
}