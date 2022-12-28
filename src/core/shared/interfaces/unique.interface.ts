export interface FindDuplicateString {
  value: string;
}

export interface ErrorDuplicateString {
  isDuplicated: boolean;
  message?: string;
}

export enum ErrorsDuplicateEntriesMessages {
  DUPLICATED = 'A record with the name DUPLICATED already exists',
  NO_DUPLICATED = 'There is no record with the name DUPLICATED',
}
