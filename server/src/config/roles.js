export const ROLES = Object.freeze({
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
  REGISTRAR: "registrar",
});

export const ALL_ROLES = Object.values(ROLES);

// Simple role hierarchy: admin can do everything registrar/teacher/student can.
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.REGISTRAR, ROLES.TEACHER, ROLES.STUDENT],
  [ROLES.REGISTRAR]: [ROLES.REGISTRAR],
  [ROLES.TEACHER]: [ROLES.TEACHER],
  [ROLES.STUDENT]: [ROLES.STUDENT],
};
