"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UALWaxError = void 0;
const universal_authenticator_library_1 = require("universal-authenticator-library");
class UALWaxError extends universal_authenticator_library_1.UALError {
    constructor(message, type, cause) {
        super(message, type, cause, "Wax");
    }
}
exports.UALWaxError = UALWaxError;
