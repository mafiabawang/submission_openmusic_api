const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(albumsService, songsService, validator) {
        this._albumsService = albumsService;
        this._songsService = songsService;
        this._validator = validator;

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._albumsService.addAlbum({ name, year });

        return h.response({
            status: 'success',
            data: {
                albumId
            }
        }).code(201);
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;
        const album = await this._albumsService.getAlbumById(id);
        const songs = await this._songsService.getSongsByAlbumId(album.id);

        return {
            status: 'success',
            data: {
                album: {
                    ...album,
                    songs: songs.map(song => ({
                        id: song.id,
                        title: song.title,
                        performer: song.performer
                    }))
                }
            }
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Berhasil Mengubah Album Bedasarkan Id'
        };
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;
        await this._albumsService.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Berhasil Menghapus Album Berdasarkan Id'
        };
    }
}

module.exports = AlbumsHandler;