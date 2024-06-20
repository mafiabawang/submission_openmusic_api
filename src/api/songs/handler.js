const autoBind = require('auto-bind');

class SongsHandler {
    constructor(songsService, albumsService, validator) {
        this._songsService = songsService;
        this._albumsService = albumsService;
        this._validator = validator;

        autoBind(this);
    }

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload);
        const { title, year, genre, performer, duration, albumId } = request.payload;

        if (albumId) await this._albumsService.getAlbumById(albumId);
        const songId = await this._songsService.addSong({ title, year, genre, performer, duration, albumId });

        return h.response({
            status: 'success',
            data: {
                songId
            }
        }).code(201);
    }

    async getSongsHandler(request) {
        const { title, performer } = request.query;
        const songs = await this._songsService.getSongs(title, performer);
        return {
            status: 'success',
            data: {
                songs
            }
        };
    }

    async getSongByIdHandler(request) {
        const { id } = request.params;
        const song = await this._songsService.getSongById(id);
        return {
            status: 'success',
            data: {
                song
            }
        };
    }

    async putSongByIdHandler(request) {
        this._validator.validateSongPayload(request.payload);
        const { id } = request.params;
        await this._songsService.editSongById(id, request.payload);

        return {
            status: 'success',
            message: 'Berhasil Mengubah Lagu Bedasarkan Id'
        };
    }

    async deleteSongByIdHandler(request) {
        const { id } = request.params;
        await this._songsService.deleteSongById(id);

        return {
            status: 'success',
            message: 'Lagu Berhasil Dihapus'
        };
    }
}

module.exports = SongsHandler;