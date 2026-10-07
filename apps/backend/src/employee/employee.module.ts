import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { EmployeeController } from './employee.controller';

@Module({
  providers: [EmployeeService, EmployeeRepository],
  imports: [PrismaModule],
  controllers: [EmployeeController]
})
export class EmployeeModule {}
