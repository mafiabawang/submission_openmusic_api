const { nanoid } = require('nanoid');
const { DBUtils } = require('../utils');
const { InvariantError, NotFoundError } = require('../exceptions');
const tableNames = 'collaborations';

class CollaborationsService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async verifyCollaborator(playlistId, userId) {
        const rows = await this._dbUtils.select([], tableNames, 'playlist_id = $1 AND user_id = $2', [playlistId, userId]);
        if (!rows.length) throw new InvariantError('Kolaborasi gagal diverifikasi');
    }

    async addCollaboration(playlist_id, user_id) {
        const playlistQuery = await this._dbUtils.select([], 'playlists', 'id = $1', [playlist_id]);
        if (!playlistQuery.length) throw new NotFoundError('Playlist tidak ditemukan.');

        const userQuery = await this._dbUtils.select([], 'users', 'id = $1', [user_id]);
        if (!userQuery.length) throw new NotFoundError('User tidak ditemukan.');

        const id = `collab-${nanoid(16)}`;
        const values = [id, playlist_id, user_id];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0]?.id) throw new InvariantError('Kolaborasi gagal ditambahkan');
        return rows[0].id;
    }

    async deleteCollaboration(playlistId, userId) {
        const rows = await this._dbUtils.delete(tableNames, 'playlist_id = $1 AND user_id = $2', [playlistId, userId]);
        if (!rows.length) throw new NotFoundError('Kolaborasi gagal dihapus');
    }
}

module.exports = CollaborationsService;