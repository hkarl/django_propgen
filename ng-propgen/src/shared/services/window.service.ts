import {EventEmitter, Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

const storagePrefix = 'propMsg_';

export class Message {
  senderId: string;
  event: string;
  data: any;
}

export class MessageWindow {
  constructor(private handle: Window, private storageKey: string) {
    if(handle === null) {
      throw 'Could not open window';
    }
    handle.onbeforeunload = () => {
      this.close();
    };

  }

  public onClose = new EventEmitter();

  public close() {
    if(!this.handle.closed) {
      this.handle.close();
    }
    this.onClose.emit();
  }

  public sendMessage(event: string, data: any) {
    let msg: Message = {
      senderId: this.storageKey,
      event: event,
      data: data
    };
    localStorage.setItem(this.storageKey, JSON.stringify(msg));
    localStorage.removeItem(this.storageKey);
  }
}

@Injectable()
export class WindowService implements OnDestroy {

  constructor() {
    this.thisWindow = WindowService.constructStorageKeyFromPath(window.location.pathname);
    window.addEventListener('storage', this.onStorage.bind(this), false);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.onStorage.bind(this));
    // TODO: maybe this is not a good idea
    for(const win in this.openedWindows) {
      if(this.openedWindows[win]) {
        this.openedWindows[win].close();
      }
    }
  }

  private openedWindows: {[handle: string]: MessageWindow} = {};
  private thisWindow: string;
  private messageSubject: Subject<Message> = new Subject<Message>();

  private static generateId(length): string {
    let text = "",
      possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( let i=0; i < (length || 5); i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private static constructStorageKeyFromPath(path: string): string {
    return storagePrefix + path;
  }

  public createWindow(url: string, target: string = "_blank", flags: string = "location=no,menubar=no"): MessageWindow {
    url = url + WindowService.generateId(5);
    let win = window.open(url, target, flags);
    if(!win) {
      return null;
    }
    // it would be more optimal to actually use win.location.pathname here as well, but at this point it is still about:blank
    const storageKey = WindowService.constructStorageKeyFromPath(url);
    let w = new MessageWindow(win, storageKey);
    w.onClose.subscribe(() => {
      if(url in this.openedWindows) {
        delete this.openedWindows[url];
      }
    });
    this.openedWindows[url] = w;
    return w;
  }

  public onMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  private onStorage(event) {
    const key = event.key,
      newValue = event.newValue,
      isRemoved = !newValue;

    if(key === this.thisWindow && !isRemoved) {
      let obj = (<Message>JSON.parse(newValue));
      if(!obj) {
        return;
      }
      this.messageSubject.next(obj);
    }
  }

}
