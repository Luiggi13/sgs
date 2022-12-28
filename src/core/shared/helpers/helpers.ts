import { SchwarzValues } from "src/schwarz-values/schwarz-values.schema";

export function isEmptyObject(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }
  return true;
}


export function isHexColor(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}



export function hasDuplicateNameInValuesArray(core_values: SchwarzValues[]): boolean {
  const names = new Set<string>();
    for (const value of core_values) {
      if (names.has(value.name)) {
        return true;
      }
      names.add(value.name);
    }
  return false;
}

export function stringArrayToStringPhrase(arr: string[]): string {
  if (arr.length === 0) {
    return '';
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return `${arr[0]} and ${arr[1]}`;
  } else {
    const last = arr.pop();
    return `${arr.join(', ')}, and ${last}`;
  }
}