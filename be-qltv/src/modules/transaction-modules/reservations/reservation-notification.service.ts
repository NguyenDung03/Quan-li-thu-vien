import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, merge } from 'rxjs';
import { map } from 'rxjs/operators';

type ReservationCreatedPayload = {
  type: 'reservation_created';
  reservationId: string;
  readerId: string;
  bookId: string;
  message: string;
};

@Injectable()
export class ReservationNotificationService {
  private readonly adminChannel = new Subject<MessageEvent>();

  subscribeAdmin(): Observable<MessageEvent> {
    const heartbeat$ = interval(25000).pipe(
      map(() => ({ data: { type: 'ping' } })),
    );
    return merge(this.adminChannel.asObservable(), heartbeat$);
  }

  notifyAdmin(payload: ReservationCreatedPayload): void {
    this.adminChannel.next({ data: payload });
  }
}
