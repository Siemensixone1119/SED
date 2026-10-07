import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeService } from './employee/employee.service';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [PrismaModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
