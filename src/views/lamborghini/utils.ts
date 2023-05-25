const isArrayOfStrings = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string");
}
export { isArrayOfStrings }