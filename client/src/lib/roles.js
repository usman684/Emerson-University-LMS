export const ROLES = Object.freeze({
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
  REGISTRAR: "registrar",
});

export const ROLE_LABELS = {
  [ROLES.STUDENT]: "Student",
  [ROLES.TEACHER]: "Teacher",
  [ROLES.ADMIN]: "Administrator",
  [ROLES.REGISTRAR]: "Registrar",
};

export const dashboardPathForRole = (role) => `/dashboard/${role}`;
