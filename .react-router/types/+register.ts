import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/auth/login": {};
  "/auth/forgot-password": {};
  "/dashboard": {};
  "/users": {};
  "/brands": {};
  "/banners": {};
  "/notifications": {};
  "/privacy-policy": {};
  "/terms-and-conditions": {};
};