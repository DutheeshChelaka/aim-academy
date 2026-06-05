"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressController = void 0;
const common_1 = require("@nestjs/common");
const progress_service_1 = require("./progress.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProgressController = class ProgressController {
    progressService;
    constructor(progressService) {
        this.progressService = progressService;
    }
    async getVideoProgress(videoId, req) {
        return this.progressService.getVideoProgress(req.user.userId, videoId);
    }
    async trackVideoView(videoId, req, ipAddress, userAgent) {
        const deviceFingerprint = `${userAgent}-${ipAddress}`;
        return this.progressService.trackVideoView(req.user.userId, videoId, ipAddress, deviceFingerprint);
    }
    async canWatchVideo(videoId, req) {
        return this.progressService.canWatchVideo(req.user.userId, videoId);
    }
    async getUserProgress(req) {
        return this.progressService.getUserProgress(req.user.userId);
    }
    async resetProgress(videoId, req) {
        return this.progressService.resetVideoProgress(req.user.userId, videoId);
    }
};
exports.ProgressController = ProgressController;
__decorate([
    (0, common_1.Get)(':videoId'),
    __param(0, (0, common_1.Param)('videoId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getVideoProgress", null);
__decorate([
    (0, common_1.Post)(':videoId/track'),
    __param(0, (0, common_1.Param)('videoId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Ip)()),
    __param(3, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "trackVideoView", null);
__decorate([
    (0, common_1.Get)(':videoId/can-watch'),
    __param(0, (0, common_1.Param)('videoId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "canWatchVideo", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "getUserProgress", null);
__decorate([
    (0, common_1.Post)(':videoId/reset'),
    __param(0, (0, common_1.Param)('videoId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProgressController.prototype, "resetProgress", null);
exports.ProgressController = ProgressController = __decorate([
    (0, common_1.Controller)('progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [progress_service_1.ProgressService])
], ProgressController);
//# sourceMappingURL=progress.controller.js.map