import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5432')),
        username: config.get('DB_USER', 'neondb_owner'),
        password: config.get('DB_PASS', 'npg_wG4MvhX6WRKp'),
        database: config.get('DB_NAME', 'todo_db'),
        entities: [Task],
        synchronize: true,
        ssl: {
        rejectUnauthorized: false
      }
      }),
    }),
    TasksModule
  ]
})
export class AppModule {}
