import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private connection?: signalR.HubConnection;

  // push incoming messages to components
  private messagesSubject = new BehaviorSubject<string | null>(null);
  messages$: Observable<string | null> = this.messagesSubject.asObservable();

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl, {
        // IMPORTANT for proxies/gateways: start with negotiation on (default).
        // Later, if you terminate WebSockets at YARP, you can set options here.
        // accessTokenFactory: () => 'optional-jwt'
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // simple backoff
      .build();

    // Receive handler (must match server hub method name used with Clients.All.SendAsync)
    this.connection.on('ReceiveMessage', (payload: string) => {
      this.messagesSubject.next(payload);
    });

    try {
      await this.connection.start();
      console.log('SignalR connected');
    } catch (err) {
      console.error('SignalR connection error', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;
    await this.connection.stop();
    this.connection = undefined;
  }

  // Call a server hub method (we’ll implement SendMessage on the backend)
  async sendMessage(message: string): Promise<void> {
    if (!this.connection) throw new Error('Not connected');
    await this.connection.invoke('SendMessage', message);
  }
}
