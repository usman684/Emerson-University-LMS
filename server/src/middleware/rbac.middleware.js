import ApiError from "../utils/ApiError.js";

/**
 * Restricts a route to the given roles.
 * Usage: router.get('/', protect, restrictTo('admin', 'registrar'), handler)
 */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized — please log in");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not permitted to perform this action`
      );
    }

    next();
  };
};

/**
 * Allows access if req.user is the resource owner OR has one of the given roles.
 * ownerIdGetter receives req and must return the owner's id (string) to compare against req.user._id.
 */
export const restrictToOwnerOrRoles = (ownerIdGetter, ...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized — please log in");
    }

    const ownerId = ownerIdGetter(req);
    const isOwner = ownerId && ownerId.toString() === req.user._id.toString();
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      throw new ApiError(403, "You do not have permission to access this resource");
    }

    next();
  };
};
