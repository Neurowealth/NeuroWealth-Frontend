type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassInput[];
type ClassInput =
  | string
  | number
  | false
  | null
  | undefined
  | ClassDictionary
  | ClassArray;

function flattenClasses(input: ClassInput): string[] {
  if (!input) {
    return [];
  }

  if (typeof input === "string" || typeof input === "number") {
    return [String(input)];
  }

  if (Array.isArray(input)) {
    return input.flatMap(flattenClasses);
  }

  return Object.entries(input)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className);
}

export function cn(...inputs: ClassInput[]) {
  return inputs.flatMap(flattenClasses).join(" ");
}
