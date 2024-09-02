import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';





@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = this.jwtService.verify(token);
        req.user = decoded;
      } catch (error) {
        console.error('Token validation error:', error.message);
      }
    }
    next();
  }
}
