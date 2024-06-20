const { nanoid } = require('nanoid');

const DBUtils = require('../utils/DBUtils');

const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

const tableNames = 'songs';

class SongsService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async addSong({ title, year, genre, performer, duration, albumId }) {
        const id = `song-${nanoid(16)}`;

        const values = [id, title, year, genre, performer, duration, albumId];
        const rows = await this._dbUtils.insert(tableNames, values);

        if (!rows[0].id) throw new InvariantError('Gagal menambahkan lagu');
        return rows[0].id;
    }

    async getSongs(title = '', performer = '', albumId = '') {
        if (albumId) {
            const rows = await this._dbUtils.select(['id', 'title', 'performer'], tableNames, 'album_id = $1', [albumId]);
            return rows;
        } else {
            const rows = await this._dbUtils.select(['id', 'title', 'performer'], tableNames, 'title ILIKE $1 AND performer ILIKE $2', [`%${title}%`, `%${performer}%`]);
            return rows;
        }
    }

    async getSongById(id) {
        const rows = await this._dbUtils.select([], tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('Gagal mendapatkan lagu. Id tidak ditemukan');
        return rows[0];
    }

    async editSongById(id, { title, year, genre, performer, duration, albumId }) {
        const rows = await this._dbUtils.select(['title', 'year', 'genre', 'performer', 'duration', 'album_id'], tableNames, `id = $1`, [id]);
        if (!rows.length) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');

        if (rows[0].title === title && rows[0].year === year && rows[0].genre === genre && rows[0].performer === performer && rows[0].duration === duration && rows[0].album_id === albumId) throw new InvariantError('Gagal memperbarui album. Tidak ada yang berubah');

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