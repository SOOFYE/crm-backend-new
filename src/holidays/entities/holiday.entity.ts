import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('holidays')
export class HolidayEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  holidayDate: Date;

  @Column()
  description: string; // e.g., "National Day"
}