import { Module } from '@nestjs/common';
import { PaginationUtil } from './pagination.util'; // Adjust the path as necessary

@Module({
  providers: [PaginationUtil],
  exports: [PaginationUtil], // Export to make it available in other modules
})
export class UtilsModule {}