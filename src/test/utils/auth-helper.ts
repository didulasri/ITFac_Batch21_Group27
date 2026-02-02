import { APIRequestContext } from "@playwright/test";

export class AuthHelper {
    private request: APIRequestContext;
    private baseUrl: string;

    constructor(request: APIRequestContext, baseUrl: string) {
        this.request = request;
        this.baseUrl = baseUrl;
    }

    async loginAdmin(): Promise<string> {
        console.log("→ Logging in as Admin...");
        const response = await this.request.post(`${this.baseUrl}/api/auth/login`, {
            data: {
                username: "admin",
                password: "admin123"
            }
        });

        if (response.ok()) {
            const body = await response.json();
            const token = body.token || body.accessToken || body.jwt;
            console.log(`✓ Admin logged in successfully`);
            return token;
        } else {
            throw new Error(`Admin login failed: ${response.status()}`);
        }
    }

    async loginUser(): Promise<string> {
        console.log("→ Logging in as User...");
        const response = await this.request.post(`${this.baseUrl}/api/auth/login`, {
            data: {
                username: "testuser",
                password: "test123"
            }
        });

        if (response.ok()) {
            const body = await response.json();
            const token = body.token || body.accessToken || body.jwt;
            console.log(`✓ User logged in successfully`);
            return token;
        } else {
            throw new Error(`User login failed: ${response.status()}`);
        }
    }
}