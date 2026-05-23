/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as advances from "../advances.js";
import type * as announcements from "../announcements.js";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as employees from "../employees.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as leaves from "../leaves.js";
import type * as lib_auditLog from "../lib/auditLog.js";
import type * as lib_rbac from "../lib/rbac.js";
import type * as lib_withOrg from "../lib/withOrg.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as payroll from "../payroll.js";
import type * as reports from "../reports.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  advances: typeof advances;
  announcements: typeof announcements;
  attendance: typeof attendance;
  auth: typeof auth;
  employees: typeof employees;
  files: typeof files;
  http: typeof http;
  leaves: typeof leaves;
  "lib/auditLog": typeof lib_auditLog;
  "lib/rbac": typeof lib_rbac;
  "lib/withOrg": typeof lib_withOrg;
  notifications: typeof notifications;
  organizations: typeof organizations;
  payroll: typeof payroll;
  reports: typeof reports;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
