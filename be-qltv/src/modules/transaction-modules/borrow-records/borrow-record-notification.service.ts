import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, merge } from 'rxjs';
import { map } from 'rxjs/operators';

type BorrowNotificationPayload = {
  type: 'borrow_record_created';
  borrowRecordId: string;
  readerId: string;
  message: string;
  bookTitle?: string;
  dueDate: string;
};

@Injectable()
export class BorrowRecordNotificationService {
  private readonly channels = new Map<string, Subject<MessageEvent>>();

  subscribe(readerId: string): Observable<MessageEvent> {
    const subject = this.getOrCreateChannel(readerId);
    const heartbeat$ = interval(25000).pipe(
      map(() => ({ data: { type: 'ping' } })),
    );

    return merge(subject.asObservable(), heartbeat$);
  }

  notify(readerId: string, payload: BorrowNotificationPayload): void {
    const channel = this.channels.get(readerId);
    if (!channel) return;

    channel.next({ data: payload });
  }

  private getOrCreateChannel(readerId: string): Subject<MessageEvent> {
    let channel = this.channels.get(readerId);
    if (!channel) {
      channel = new Subject<MessageEvent>();
      this.channels.set(readerId, channel);
    }
    return channel;
  }
}
