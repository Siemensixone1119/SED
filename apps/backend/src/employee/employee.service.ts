import { Injectable } from '@nestjs/common';
import { Employee } from '../../generated/prisma/client';
import { EmployeeRepository } from './employee.repository';
import { Workbook, type Buffer as ExcelBuffer } from 'exceljs';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepo: EmployeeRepository) { }

  findAll(): Promise<Employee[]> {
    return this.employeeRepo.findAll()
  }

  async importEmployees(file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer)

    const worksheet = workbook.worksheets[0]
    const rows = worksheet.getRows(1, 24)?.map(row => row.values)

    return {
      name: worksheet.name,
      rowCount: worksheet.rowCount,
      row: rows
    }
  }
}