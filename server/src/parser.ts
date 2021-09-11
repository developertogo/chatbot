type Intent<T> = {
  regexps: RegExp[];
  func: (groups: Record<string, string>) => T | null;
};

type ParserOptions<T> = {
  intents: Array<Intent<T>>,
  fallback: T,
};

export function createParser<T>({ intents, fallback }: ParserOptions<T>): ((message: string) => T) {
  return (message: string) => {
    for (const { regexps, func } of intents) {
      for (const regexp of regexps) {
        const match = regexp.exec(message);
        if (match) {
          return func(match.groups || {}) || fallback;
        }
      }
    }

    return fallback;
  };
}
