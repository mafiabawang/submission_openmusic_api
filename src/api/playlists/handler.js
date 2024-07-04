const autoBind = require('auto-bind');

class PlaylistsHandler {
    constructor(playlistsService, playlistsSongsService, playlistsActivitiesService, validator) {
        this._playlistsService = playlistsService;
        this._playlistsSongsService = playlistsSongsService;
        this._playlistsActivitiesService = playlistsActivitiesService;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistsPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

        return h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        }).code(201);
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._playlistsService.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistsOwner(id, credentialId);
        await this._playlistsService.deletePlaylistsById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus'
        };
    }

    async postSongToPlaylistHandler(request, h) {
        this._validator.validatePlaylistSongsPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistsAccess(playlistId, credentialId);
        await this._playlistsService.verifyPlaylistId(playlistId);
        await this._playlistsSongsService.addSongToPlaylist(playlistId, songId);
        await this._playlistsActivitiesService.addActivity({ playlist_id: playlistId, song_id: songId, user_id: credentialId });

        return h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        }).code(201);
    }

    async getSongsFromPlaylistByIdHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;

        await this._playlistsService.verifyPlaylistsAccess(playlistId, credentialId);
        await this._playlistsService.verifyPlaylistId(playlistId);

        const playlists = await this._playlistsService.getPlaylistsById(playlistId);
        const songs = await this._playlistsSongsService.getSongsFromPlaylist(playlistId);

        return {
            status: 'success',
            data: {
                playlist: {
                    ...playlists,
                    songs: songs.map(song => ({
                        id: song.id,
                        title: song.title,
                        performer: song.performer
                    }))
                }
            }
        };
    }

    async deleteSongFromPlaylistByIdHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistsAccess(playlistId, credentialId);
        await this._playlistsSongsService.deleteSongFromPlaylist(playlistId, songId);
        await this._playlistsActivitiesService.deleteActivity({ playlist_id: playlistId, song_id: songId, user_id: credentialId });

        return h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        });
    }

    async getPlaylistActivitiesHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;

        await this._playlistsService.verifyPlaylistsAccess(playlistId, credentialId);
        await this._playlistsService.verifyPlaylistId(playlistId);

        const playlist_id = await this._playlistsService.getPlaylistsById(playlistId);
        const activities = await this._playlistsActivitiesService.getActivities(playlistId);

        return {
            status: 'success',
            data: {
                playlistId: playlist_id.id,
                activities: activities.map(activity => ({
                    username: activity.username,
                    title: activity.title,
                    action: activity.action,
                    time: activity.time
                }))
            }
        }
    }
}

module.exports = PlaylistsHandler;