const { nanoid } = require('nanoid');
const { DBUtils } = require('../utils');
const { InvariantError, NotFoundError } = require('../exceptions');
const tableNames = 'songs';

class SongsService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async addSong({ title, year, genre, performer, duration, albumId }) {
        const id = `song-${nanoid(16)}`;
        const values = [id, title, year, genre, performer, duration, albumId];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0]?.id) throw new InvariantError('Gagal menambahkan lagu');
        return rows[0].id;
    }

    async getSongs(title = '', performer = '') { return await this._dbUtils.select(['id', 'title', 'performer'], tableNames, 'title ILIKE $1 AND performer ILIKE $2', [`%${title}%`, `%${performer}%`]) }

    async getSongsByAlbumId(albumId) { return await this._dbUtils.select(['id', 'title', 'performer'], tableNames, 'album_id = $1', [albumId]) }

    async getSongById(id) {
        const rows = await this._dbUtils.select([], tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('Gagal mendapatkan lagu. Id tidak ditemukan');
        return rows[0];
    }

    async editSongById(id, { title, year, genre, performer, duration, albumId }) {
        const existingSong = await this.getSongById(id);
        if (existingSong.title === title && existingSong.year === year && existingSong.genre === genre && existingSong.performer === performer && existingSong.duration === duration && existingSong.album_id === albumId) throw new InvariantError('Gagal memperbarui album. Tidak ada yang berubah');

        const columns = ['title', 'year', 'genre', 'performer', 'duration', 'album_id'];
        const values = [title, year, genre, performer, duration, albumId, id];
        await this._dbUtils.update(tableNames, columns, `id = $${values.length}`, values);
    }

    async deleteSongById(id) {
        const rows = await this._dbUtils.delete(tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
}

module.exports = SongsService;