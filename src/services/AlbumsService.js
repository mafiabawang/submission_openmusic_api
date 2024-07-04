const { nanoid } = require('nanoid');
const { DBUtils } = require('../utils');
const { InvariantError, NotFoundError } = require('../exceptions');
const tableNames = 'albums';

class AlbumsService {
    constructor() { this._dbUtils = new DBUtils() }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const values = [id, name, year];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0]?.id) throw new InvariantError('Gagal Menambahkan Album');
        return rows[0].id;
    }

    async getAlbumById(id) {
        const rows = await this._dbUtils.select([], tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('Album tidak ditemukan');
        return rows[0];
    }

    async editAlbumById(id, { name, year }) {
        const existingAlbum = await this.getAlbumById(id);
        if (existingAlbum.name === name && existingAlbum.year === year) throw new InvariantError('Gagal memperbarui album. Tidak ada yang berubah');

        const columns = ['name', 'year'];
        const values = [name, year, id];
        await this._dbUtils.update(tableNames, columns, `id = $${values.length}`, values);
    }

    async deleteAlbumById(id) {
        const rows = await this._dbUtils.delete(tableNames, 'id = $1', [id]);
        if (!rows.length) throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
    }
}

module.exports = AlbumsService;