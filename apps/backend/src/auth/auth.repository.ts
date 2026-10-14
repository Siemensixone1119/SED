import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { loginDataDto } from './dto/login.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) { }

  findEmployeeByLogin(login: loginDataDto) {
    return this.prismaService.employee.findUnique({
      where: {
        login,
      }
    })
  }
}
