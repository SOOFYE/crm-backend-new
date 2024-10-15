import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { HolidayEntity } from "./entities/holiday.entity";

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(HolidayEntity)
    private holidayRepo: Repository<HolidayEntity>,
  ) {}

  async isHoliday(date: Date): Promise<boolean> {
    const holiday = await this.holidayRepo.findOne({ where: { holidayDate: date } });
    return !!holiday;
  }


  // Get all holidays in a specific month of a specific year
  async getHolidaysByMonth(month: number, year: number): Promise<HolidayEntity[]> {
    const startDate = new Date(year, month - 1, 1); // First day of the month
    const endDate = new Date(year, month, 0); // Last day of the month

    return await this.holidayRepo.find({
      where: {
        holidayDate: Between(startDate, endDate),
      },
    });
  }
}