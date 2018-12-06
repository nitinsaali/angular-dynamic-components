import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class MessageService {
  @Output() message: EventEmitter<Object> = new EventEmitter(); 

  /**
   * Set the message and message type 
   * @param {string} message the message to set to
   * @param {string} type a CSS class understood by the Semantic UI message collection, or null  
   */
  setMessage(message: string, type: string) {
    if(type != "error" && type != "warning" && type != "success" && type != "info" && type != null) {
      console.log("MessageService: message received but with invalid type. Please use one of [error, warning, success, info, null].");
    } else {
      this.message.emit({
        message: message,
        type: type
      });
    }
  }
}