import type { Request, Response } from "express";
import * as customersService from "./customers.service.js";
import type { CustomerQueryDto, UpdateCustomerDto } from "./customers.dto.js";

export async function getAllCustomers(
  req: Request,
  res: Response
): Promise<void> {
  const query = req.query as unknown as CustomerQueryDto;
  const result = await customersService.getAllCustomers(query);
  res.status(200).json(result);
}

export async function getCustomerDetail(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const result = await customersService.getCustomerDetail(id);
  res.status(200).json(result);
}

export async function updateCustomer(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const dto = req.body as UpdateCustomerDto;
  const result = await customersService.updateCustomer(id, dto);
  res.status(200).json(result);
}
