export class KudosNotFound {
  error_message: string;
  status_code: number;

  constructor(message: string, code: number) {
    this.error_message = message;
    this.status_code = code;
  }

  kudos() {
    return {
      error_message: this.error_message,
      status_code: this.status_code,
    };
  }
}
