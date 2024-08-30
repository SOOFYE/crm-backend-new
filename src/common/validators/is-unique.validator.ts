import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  import { Injectable, Type } from '@nestjs/common';
  import { DataSource } from 'typeorm';
import { AppDataSource } from 'src/database/data-source';
  
  @Injectable()
  @ValidatorConstraint({ async: true })
  export class IsUniqueConstraint implements ValidatorConstraintInterface {
    constructor(private readonly dataSource: DataSource) {
      if (!this.dataSource) {
        console.error('DataSource is not injected!');
        
      }
      this.dataSource = AppDataSource;
    }
  
    async validate(value: any, args: ValidationArguments): Promise<boolean> {
      console.log('Validating:', value, args.constraints);
  
      const [EntityClass, property] = args.constraints;

      console.log('EntityClass:', EntityClass);  // Log EntityClass to check its value
      console.log('Property:', property);  // Log property to check its value

      const repository = this.dataSource.getRepository(EntityClass);
  
      const condition = {};
      condition[property] = value;
  
      const existingRecord = await repository.findOne({
        where: condition,
      });
  
      console.log('Existing record:', existingRecord);
  
      return !existingRecord;
    }
  
    defaultMessage(args: ValidationArguments) {
      const [EntityClass, property] = args.constraints;
      return `${property} already exists`;
    }
  }
  
  export function IsUnique(EntityClass: Type<any>, property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [EntityClass, property],
        validator: IsUniqueConstraint,
      });
    };
  }