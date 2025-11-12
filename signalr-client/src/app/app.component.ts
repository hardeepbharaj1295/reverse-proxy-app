import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalRService } from './signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <main class="container">
    <h1>SignalR Demo</h1>

    <section class="controls">
      <button (click)="onConnect()" [disabled]="connecting || connected">
        {{ connecting ? 'Connecting...' : connected ? 'Connected' : 'Connect' }}
      </button>

      <input [(ngModel)]="outgoing" placeholder="Type a message..." />
      <button (click)="onSend()" [disabled]="!connected">Send</button>
    </section>

    <section class="status">
      <p>Status: <strong>{{ connected ? 'Connected' : 'Disconnected' }}</strong></p>
      <p *ngIf="lastMessage">Last message: <code>{{ lastMessage }}</code></p>
    </section>
  </main>
  `,
  styles: [`
    .container { max-width: 720px; margin: 2rem auto; padding: 1rem; }
    .controls { display: flex; gap: .5rem; align-items: center; margin-bottom: 1rem; }
    input { flex: 1; padding: .5rem; }
    button { padding: .5rem .75rem; cursor: pointer; }
    code { background: #f6f8fa; padding: .2rem .4rem; border-radius: 4px; }
  `]
})
export class AppComponent {
  connected = false;
  connecting = false;
  outgoing = 'Hello from Angular!';
  lastMessage: string | null = null;

  constructor(private hub: SignalRService) {
    this.hub.messages$.subscribe(msg => {
      if (msg !== null) this.lastMessage = msg;
    });
  }

  async onConnect() {
    if (this.connected || this.connecting) return;
    this.connecting = true;
    try {
      await this.hub.connect();
      this.connected = true;
    } catch (e) {
      alert('Failed to connect. Check console for details.');
    } finally {
      this.connecting = false;
    }
  }

  async onSend() {
    try {
      await this.hub.sendMessage(this.outgoing.trim() || 'ping');
    } catch (e) {
      alert('Not connected or send failed.');
    }
  }
}
