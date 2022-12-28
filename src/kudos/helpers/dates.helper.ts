import { HttpStatus } from '@nestjs/common';
import { isValid } from 'date-fns';
import { ErrorsDateMessage, FilterDate, InvalidDate } from 'src/core/shared/interfaces';

export function isValidDateHelper(filters: FilterDate): {
  errors: boolean;
  reponses?: InvalidDate;
} {
  const isFromValid = isValid(new Date(filters.from));
  const isToValid = !filters.to
    ? isValid(new Date())
    : isValid(new Date(filters.to));

  if (
    (isFromValid || isToValid) &&
    new Date(filters.from).getTime() > new Date(filters.to).getTime()
  ) {
    const responses: InvalidDate = {
      message_from: ErrorsDateMessage.VALID_DATE,
      message_to: ErrorsDateMessage.LESS,
      status_code: HttpStatus.BAD_REQUEST,
    };
    return { errors: true, reponses: responses };
  }

  if (!isFromValid || !isToValid) {
    const responses: InvalidDate = {
      message_from: isFromValid
        ? ErrorsDateMessage.VALID_DATE
        : ErrorsDateMessage.INVALID_DATE,
      message_to: isToValid
        ? ErrorsDateMessage.VALID_DATE
        : ErrorsDateMessage.INVALID_DATE,
      status_code: HttpStatus.FORBIDDEN,
    };
    return { errors: true, reponses: responses };
  }
  return { errors: false };
}
