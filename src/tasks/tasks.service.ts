import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly repo: Repository<Task>) {}

  async create(dto: CreateTaskDto) {
    const task = this.repo.create({
      name: dto.name,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      status: dto.status,
      priority: dto.priority,
      isActive: dto.isActive ?? true
    });
    return await this.repo.save(task);
  }

  async findAll(query: QueryTasksDto) {
    const { page = 1, limit = 10, status, priority, search, dueDateFrom, dueDateTo, isActive } = query;
    const qb = this.repo.createQueryBuilder('task');
    if (status) qb.andWhere('task.status = :status', { status });
    if (priority) qb.andWhere('task.priority = :priority', { priority });
    if (search) qb.andWhere('LOWER(task.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
    if (dueDateFrom) qb.andWhere('task.dueDate >= :dueDateFrom', { dueDateFrom: new Date(dueDateFrom) });
    if (dueDateTo) qb.andWhere('task.dueDate <= :dueDateTo', { dueDateTo: new Date(dueDateTo) });
    if (isActive === 'true') qb.andWhere('task.isActive = true');
    if (isActive === 'false') qb.andWhere('task.isActive = false');
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { data: items, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id);
    Object.assign(task, dto, { dueDate: dto.dueDate ? new Date(dto.dueDate) : null });
    return await this.repo.save(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    task.isActive = false;
    return await this.repo.save(task);
  }
}
