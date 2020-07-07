export function firstToUpper(w: string) : string {
    // converts first character of given word to uppercase.
    // computer => Computer
    return w[0].toUpperCase()+w.slice(1);
}
