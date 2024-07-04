const { nanoid } = require('nanoid');
const { DBUtils } = require('../utils');
const { InvariantError, NotFoundError, AuthorizationError } = require('../exceptions');
const tableNames = 'playlists';

class PlaylistsService {
    constructor(collaborationsService) {
        this._dbUtils = new DBUtils();
        this._collaborationsService = collaborationsService;
    }

    async verifyPlaylistsOwner(id, owner) {
        const rows = await this._dbUtils.select(['owner'], tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('User tidak ditemukan');
        if (rows[0].owner !== owner) throw new AuthorizationError('Anda tidak memiliki hak akses');
    }

    async verifyPlaylistsAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistsOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const values = [id, name, owner];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0]?.id) throw new InvariantError('Playlist gagal ditambahkan.');
        return rows[0].id;
    }

    async getPlaylists(owner) {
        const rows = await this._dbUtils.select(['playlists.id', 'name', 'username'], tableNames, 'owner = $1 OR collaborations.user_id = $1', [owner], 'LEFT', ['users', 'collaborations'], ['users.id = playlists.owner', 'collaborations.playlist_id = playlists.id'], 'playlists.id, users.username');
        return rows;
    }

    async verifyPlaylistId(id) {
        const rows = await this._dbUtils.select([], tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('Playlist tidak ditemukan');
    }

    async getPlaylistsById(id) {
        const rows = await this._dbUtils.select(['playlists.id', 'name', 'username'], tableNames, 'playlists.id = $1', [id], 'INNER', ['users'], ['users.id = playlists.owner']);
        return rows[0];
    }

    async deletePlaylistsById(id) {
        const rows = await this._dbUtils.delete(tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
}

module.exports = PlaylistsService;