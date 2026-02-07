import { APIRequestContext, APIResponse } from "@playwright/test";

export class ApiHelper {
  private request: APIRequestContext;
  private baseUrl: string;
  private authToken?: string;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
    console.log(`Auth token set: ${token.substring(0, 20)}...`);
  }

  getAuthToken() {
    return this.authToken;
  }

  getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  async get(endpoint: string): Promise<APIResponse> {
    console.log(`→ GET ${this.baseUrl}${endpoint}`);
    const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
    console.log(`← Response: ${response.status()}`);
    return response;
  }

  async post(endpoint: string, data: any): Promise<APIResponse> {
    console.log(`→ POST ${this.baseUrl}${endpoint}`);
    console.log(`  Body: ${JSON.stringify(data)}`);
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      data: data,
    });
    console.log(`← Response: ${response.status()}`);
    return response;
  }

  async put(endpoint: string, data: any): Promise<APIResponse> {
    console.log(`→ PUT ${this.baseUrl}${endpoint}`);
    console.log(`  Body: ${JSON.stringify(data)}`);
    const response = await this.request.put(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      data: data,
    });
    console.log(`← Response: ${response.status()}`);
    return response;
  }

  async delete(endpoint: string): Promise<APIResponse> {
    console.log(`→ DELETE ${this.baseUrl}${endpoint}`);
    const response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
    console.log(`← Response: ${response.status()}`);
    return response;
  }

  async getResponseBody(response: APIResponse): Promise<any> {
    try {
      return await response.json();
    } catch (error) {
      return await response.text();
    }
  }
}
