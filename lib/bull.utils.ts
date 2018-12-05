import 'reflect-metadata';
import { QueueOptions } from 'bull';
import { TASK_METADATA, TASK_CONFIGURATION_METADATA } from './bull.constants';

export interface TaskMetadata {
    name: string;
    queue?: string;
    concurrency?: number;
    options?: QueueOptions;
}

export interface TaskRegisterMetadata {
    queue?: string;
    concurrency?: number;
    options?: QueueOptions;
}

export const Task = (metadata?: TaskMetadata | string): MethodDecorator => {
    return (target, key, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(TASK_CONFIGURATION_METADATA, metadata, descriptor.value);
        Reflect.defineMetadata(TASK_METADATA, true, descriptor.value);
        return descriptor;
    };
};