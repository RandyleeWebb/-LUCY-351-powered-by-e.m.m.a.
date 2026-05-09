"use strict";
/**
 * IIntegration.ts
 * Common interface for all external tool/service integrations in Lucy Sovereign 351.
 * Provides lifecycle management, status detection, and action execution.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIntegration = exports.IntegrationType = exports.IntegrationStatus = void 0;
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["UNKNOWN"] = "unknown";
    IntegrationStatus["AVAILABLE"] = "available";
    IntegrationStatus["NOT_INSTALLED"] = "not_installed";
    IntegrationStatus["OFFLINE"] = "offline";
    IntegrationStatus["ERROR"] = "error";
    IntegrationStatus["INITIALIZING"] = "initializing";
    IntegrationStatus["RUNNING"] = "running";
    IntegrationStatus["STOPPED"] = "stopped"; // Was running, now stopped
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["GAME_ENGINE"] = "game-engine";
    IntegrationType["AI_ASSISTANT"] = "ai-assistant";
    IntegrationType["THREE_D_MODELING"] = "3d-modeling";
    IntegrationType["API"] = "api";
    IntegrationType["COMMUNICATION"] = "communication";
    IntegrationType["CLOUD"] = "cloud";
    IntegrationType["SYSTEM_UTILITY"] = "system-utility";
    IntegrationType["CUSTOM"] = "custom";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
/**
 * Base abstract class providing common integration functionality.
 * Concrete adapters can extend this for shared behavior.
 */
class BaseIntegration {
    constructor(config) {
        this.status = IntegrationStatus.UNKNOWN;
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.config = config;
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                id: this.id,
                status: this.status,
                installed: this.status === IntegrationStatus.AVAILABLE || this.status === IntegrationStatus.RUNNING,
                executable: this.executablePath,
                version: this.version,
                lastChecked: this.lastStatusCheck || new Date(),
            };
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            // Default: no-op, override if cleanup needed
            this.status = IntegrationStatus.STOPPED;
        });
    }
    /**
     * Helper: resolve executable path from config based on platform.
     */
    resolveExecutablePath() {
        if (!this.config.executable)
            return undefined;
        const platform = process.platform;
        if (platform === 'win32' && this.config.executable.windows) {
            return this.config.executable.windows;
        }
        else if (platform === 'linux' && this.config.executable.linux) {
            return this.config.executable.linux;
        }
        else if (platform === 'darwin' && this.config.executable.darwin) {
            return this.config.executable.darwin;
        }
        return this.config.executable.default;
    }
    /**
     * Helper: create standard success result.
     */
    createSuccess(data, output, executionTime) {
        return { success: true, data, output, executionTime };
    }
    /**
     * Helper: create standard error result.
     */
    createError(error, executionTime) {
        return { success: false, error, executionTime };
    }
}
exports.BaseIntegration = BaseIntegration;
