import { z } from 'zod';

export const employeeSchema = z.object({
  tab_number: z.int(),
  login: z.string(),
  surname: z.string(),
  name: z.string(),
  patronymic: z.string().nullable(),
  departmentName: z.string(),
  positionName: z.string(),
  manager_tab_number: z.int().nullable(),
});

export type EmployeeValide = z.infer<typeof employeeSchema>;
