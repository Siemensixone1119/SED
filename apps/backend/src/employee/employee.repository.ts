import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Employee } from '../../generated/prisma/client';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prismaService: PrismaService){}

  findAll(): Promise<Employee[]>{
    return this.prismaService.employee.findMany()
  }
}
