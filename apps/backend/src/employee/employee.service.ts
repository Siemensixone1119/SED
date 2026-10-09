import { BadRequestException, Injectable } from '@nestjs/common';
import { Employee } from '../../generated/prisma/client';
import { EmployeeRepository } from './employee.repository';
import { Workbook, type Buffer as ExcelBuffer } from 'exceljs';
import { z, safeParse } from 'zod';
import { employeeSchema, EmployeeValide } from './schemas/employee-import.schema';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepo: EmployeeRepository) { }

  findAll(): Promise<Employee[]> {
    return this.employeeRepo.findAll();
  }

  async importEmployees(file: Express.Multer.File) {
    const workbook = new Workbook();
    await workbook.xlsx.load(file.buffer);
    const employeeList: EmployeeValide[] = []

    const worksheet = workbook.worksheets[0];
    const rows = worksheet.getRows(2, 13)?.map((row) => row.values);

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      if (!row.hasValues) continue;

      const employee = {
        tab_number: row.getCell(1).value,
        login: row.getCell(2).value,
        surname: row.getCell(3).value,
        name: row.getCell(4).value,
        patronymic: row.getCell(5).value,
        departmentName: row.getCell(6).value,
        positionName: row.getCell(7).value,
        manager_tab_number: row.getCell(8).value,
      };

      const result = employeeSchema.safeParse(employee);

      if (!result.success) {
        throw new BadRequestException({
          message: 'Ошибка валидации',
          row: i,
          errors: result.error.issues,
        });
      }

      employeeList.push(result.data)
    }

    return this.employeeRepo.upsertMany(employeeList)
  }
}
