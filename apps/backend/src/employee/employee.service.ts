import { Injectable } from '@nestjs/common';
import { Employee } from '../../generated/prisma/client';
import { EmployeeRepository } from './employee.repository';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepo: EmployeeRepository) { }

  findAll(): Promise<Employee[]> {
    return this.employeeRepo.findAll()
  }
}