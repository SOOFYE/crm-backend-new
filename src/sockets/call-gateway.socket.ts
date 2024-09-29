import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class CallGateway {
  @WebSocketServer()
  server: Server;

  // Emit event to the agent
  notifyAgent(agentId: string, data: any) {
    this.server.to(agentId).emit('callStatus', data);
  }
}