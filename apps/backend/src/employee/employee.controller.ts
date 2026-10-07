import { Controller, Get } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from '../../generated/prisma/client';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService){}

  @Get()
  findAll(): Promise<Employee[]>{
    return this.employeeService.findAll()
  }
}
