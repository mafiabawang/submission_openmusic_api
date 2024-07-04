const autoBind = require('auto-bind');

class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        this._validator.validateCollaborationsPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsService.verifyPlaylistsOwner(playlistId, credentialId);
        const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

        return h.response({
            status: 'success',
            message: 'Kolaborasi berhasil ditambahkan',
            data: {
                collaborationId
            }
        }).code(201);
    }

    async deleteCollaborationHandler(request) {
        this._validator.validateCollaborationsPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsService.verifyPlaylistsOwner(playlistId, credentialId);
        await this._collaborationsService.deleteCollaboration(playlistId, userId);

        return {
            status: 'success',
            message: 'Kolaborasi berhasil dihapus',
        };
    }
}

module.exports = CollaborationsHandler;