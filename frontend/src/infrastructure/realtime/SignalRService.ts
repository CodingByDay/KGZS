import * as signalR from '@microsoft/signalr';
import { StorageService } from '../storage/StorageService';

export interface EvaluationStatusChangedEvent {
  evaluationEventId: string;
  status: string;
}

export interface EvaluationSessionCreatedEvent {
  evaluationEventId: string;
  sessionId: string;
}

export interface ExpertEvaluationSubmittedEvent {
  evaluationEventId: string;
  productSampleId: string;
}

export interface ScoreCalculatedEvent {
  evaluationEventId: string;
  productSampleId: string;
  score: number | null;
}

export interface ProtocolGeneratedEvent {
  evaluationEventId: string;
  protocolId: string;
}

type EventHandler<T> = (event: T) => void;

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;

  private statusChangedHandlers: EventHandler<EvaluationStatusChangedEvent>[] = [];
  private sessionCreatedHandlers: EventHandler<EvaluationSessionCreatedEvent>[] = [];
  private evaluationSubmittedHandlers: EventHandler<ExpertEvaluationSubmittedEvent>[] = [];
  private scoreCalculatedHandlers: EventHandler<ScoreCalculatedEvent>[] = [];
  private protocolGeneratedHandlers: EventHandler<ProtocolGeneratedEvent>[] = [];

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = StorageService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';
      const hubUrl = `${apiBaseUrl}/hubs/evaluation`;

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      // Register event handlers
      this.connection.on('EvaluationStatusChanged', (event: EvaluationStatusChangedEvent) => {
        this.statusChangedHandlers.forEach((handler) => handler(event));
      });

      this.connection.on('EvaluationSessionCreated', (event: EvaluationSessionCreatedEvent) => {
        this.sessionCreatedHandlers.forEach((handler) => handler(event));
      });

      this.connection.on('ExpertEvaluationSubmitted', (event: ExpertEvaluationSubmittedEvent) => {
        this.evaluationSubmittedHandlers.forEach((handler) => handler(event));
      });

      this.connection.on('ScoreCalculated', (event: ScoreCalculatedEvent) => {
        this.scoreCalculatedHandlers.forEach((handler) => handler(event));
      });

      this.connection.on('ProtocolGenerated', (event: ProtocolGeneratedEvent) => {
        this.protocolGeneratedHandlers.forEach((handler) => handler(event));
      });

      await this.connection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async joinEvaluationGroup(evaluationEventId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinEvaluationGroup', evaluationEventId);
    }
  }

  async leaveEvaluationGroup(evaluationEventId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveEvaluationGroup', evaluationEventId);
    }
  }

  onStatusChanged(handler: EventHandler<EvaluationStatusChangedEvent>): () => void {
    this.statusChangedHandlers.push(handler);
    return () => {
      const index = this.statusChangedHandlers.indexOf(handler);
      if (index > -1) {
        this.statusChangedHandlers.splice(index, 1);
      }
    };
  }

  onSessionCreated(handler: EventHandler<EvaluationSessionCreatedEvent>): () => void {
    this.sessionCreatedHandlers.push(handler);
    return () => {
      const index = this.sessionCreatedHandlers.indexOf(handler);
      if (index > -1) {
        this.sessionCreatedHandlers.splice(index, 1);
      }
    };
  }

  onEvaluationSubmitted(handler: EventHandler<ExpertEvaluationSubmittedEvent>): () => void {
    this.evaluationSubmittedHandlers.push(handler);
    return () => {
      const index = this.evaluationSubmittedHandlers.indexOf(handler);
      if (index > -1) {
        this.evaluationSubmittedHandlers.splice(index, 1);
      }
    };
  }

  onScoreCalculated(handler: EventHandler<ScoreCalculatedEvent>): () => void {
    this.scoreCalculatedHandlers.push(handler);
    return () => {
      const index = this.scoreCalculatedHandlers.indexOf(handler);
      if (index > -1) {
        this.scoreCalculatedHandlers.splice(index, 1);
      }
    };
  }

  onProtocolGenerated(handler: EventHandler<ProtocolGeneratedEvent>): () => void {
    this.protocolGeneratedHandlers.push(handler);
    return () => {
      const index = this.protocolGeneratedHandlers.indexOf(handler);
      if (index > -1) {
        this.protocolGeneratedHandlers.splice(index, 1);
      }
    };
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected || false;
  }
}

export const signalRService = new SignalRService();
