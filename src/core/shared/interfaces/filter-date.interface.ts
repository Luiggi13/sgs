export interface FilterDate {
  from: string;
  to: string;
}

interface ErrorDate {
  status_code: number;
  message_from: string;
  message_to: string;
}

export type InvalidDate = Required<ErrorDate>;

export enum ErrorsDateMessage {
  INVALID_DATE = 'Invalid date',
  VALID_DATE = 'Valid date',
  LESS = 'End date should not be less than start date',
}
