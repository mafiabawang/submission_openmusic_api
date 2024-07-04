const { nanoid } = require('nanoid');
const { DBUtils } = require('../utils');
const { InvariantError, NotFoundError } = require('../exceptions');
const tableNames = 'playlist_songs';

class PlaylistsService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async addSongToPlaylist(playlistId, songId) {
        const checkSongs = await this._dbUtils.select([], 'songs', 'id = $1', [songId]);
        if (!checkSongs.length) throw new NotFoundError('Lagu gagal ditambahkan');

        const id = `playlist-song-${nanoid(16)}`;
        const values = [id, playlistId, songId];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0]?.id) throw new InvariantError('Gagal Menambahkan Album');
        return rows[0].id;
    }

    async getSongsFromPlaylist(playlistId) {
        const rows = this._dbUtils.select(['songs.id', 'title', 'performer'], tableNames, 'playlist_id = $1', [playlistId], 'INNER', ['songs'], ['songs.id = playlist_songs.song_id']);
        return rows;
    }

    async deleteSongFromPlaylist(playlistId, songId) {
        const rows = await this._dbUtils.delete(tableNames, 'playlist_id = $1 AND song_id = $2', [playlistId, songId]);
        if (!rows.length) throw new InvariantError('Playlist song gagal dihapus, playlist id dan song id tidak ditemukan');
    }
}

module.exports = PlaylistsService;