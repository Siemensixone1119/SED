import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Employee } from '../../generated/prisma/client';
import type { EmployeeValide } from './schemas/employee-import.schema';
import { TransactionClient } from '../../generated/prisma/internal/prismaNamespace';
import { DirectoryRecord } from './types/directory.type';
import { ManagersData, ManagersList } from './types/employee.type';

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prismaService: PrismaService) { }

  findAll(): Promise<Employee[]> {
    return this.prismaService.employee.findMany();
  }

  upsertMany(employees: EmployeeValide[]) {
    return this.prismaService.$transaction(async (tx) => {
      console.time('Database import');
      const { departmentsData, positionsData } = await this.prepareDirectories(tx, employees)
      const employeesData = this.prepareEmployeesData(employees, departmentsData, positionsData)

      for (const employee of employeesData) {
        await tx.employee.upsert({
          where: {
            personnelNumber: employee.personnelNumber
          },
          update: employee,
          create: employee
        })
      }

      const managersList = await tx.employee.findMany({
        select: {
          personnelNumber: true,
          id: true
        }
      });

      const managersData = this.prepareManagersData(employees, managersList)
      await this.addManagers(tx, managersData)
      console.timeEnd('Database import');
      return {
        importedCount: employees.length,
        message: 'Сотрудники успешно импортированы',
      };
    });
  }

  private async prepareDirectories(
    tx: TransactionClient,
    employees: EmployeeValide[],
  ) {
    const departments = [
      ...new Set(employees.map((employee) => employee.departmentName)),
    ];
    const positions = [
      ...new Set(employees.map((employee) => employee.positionName)),
    ];

    await tx.department.createMany({
      data: departments.map((department) => ({ name: department })),
      skipDuplicates: true,
    });
    await tx.position.createMany({
      data: positions.map((position) => ({ name: position })),
      skipDuplicates: true,
    });


    const departmentsData = await tx.department.findMany({
      where: {
        name: { in: departments }
      },
      select: { id: true, name: true }
    })
    const positionsData = await tx.position.findMany({
      where: {
        name: { in: positions }
      },
      select: { id: true, name: true }
    })

    return {
      departmentsData,
      positionsData
    }
  }

  private prepareEmployeesData(employees: EmployeeValide[], departmentsData: DirectoryRecord[], positionsData: DirectoryRecord[]) {
    return employees.map(employee => {
      const departmentId = departmentsData.find(
        department => department.name === employee.departmentName
      )?.id;
      const positionId = positionsData.find(
        position => position.name === employee.positionName
      )?.id;
      if (departmentId === undefined || positionId === undefined) {
        throw new BadRequestException(
          `Не найден отдел или должность для сотрудника ${employee.login}`
        );
      }

      return {
        login: employee.login,
        name: employee.name,
        surname: employee.surname,
        patronymic: employee.patronymic,
        personnelNumber: employee.tab_number,
        departmentId: departmentId,
        positionId: positionId
      }
    })
  }

  private prepareManagersData(employees: EmployeeValide[], managersList: ManagersList[]) {
    return employees.map(employee => {
      const managerId = managersList.find(
        manager => manager.personnelNumber === employee.manager_tab_number
      )?.id

      if (employee.manager_tab_number !== null && managerId === undefined) {
        throw new BadRequestException(
          `Не найден руководитель для сотрудника ${employee.login}`
        );
      }

      if (employee.tab_number === employee.manager_tab_number) {
        throw new BadRequestException(
          `Сотрудник ${employee.login} не может быть собственным руководителем`
        );
      }

      return {
        personnelNumber: employee.tab_number,
        managerId: managerId ?? null
      }
    })
  }

  private async addManagers(tx: TransactionClient, managersData: ManagersData[]) {
    for (const employee of managersData) {
      await tx.employee.update({
        where: {
          personnelNumber: employee.personnelNumber
        },
        data: {
          managerId: employee.managerId
        },
      })
    }
  }
}
