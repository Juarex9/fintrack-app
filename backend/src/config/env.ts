import "dotenv/config";

function must(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error (`Missing env var: ${name}`);
    return v;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT ?? 3001),
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "dev_secret_change_me"
};