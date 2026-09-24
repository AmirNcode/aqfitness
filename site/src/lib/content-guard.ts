// Keeps placeholder copy and unverified claims off the launched site (STRICT_CONTENT=true).
export interface Checkable {
  id: string;
  verified?: boolean;
  placeholder?: boolean;
}

export function contentProblems(items: Checkable[]): string[] {
  return items.filter((i) => i.verified === false || i.placeholder === true).map((i) => i.id);
}

export function assertContentReady(items: Checkable[], strict: boolean): void {
  const problems = contentProblems(items);
  if (strict && problems.length) {
    throw new Error(`STRICT_CONTENT: unresolved placeholders/unverified content: ${problems.join(', ')}`);
  }
}
